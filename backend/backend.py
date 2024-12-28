from fastapi import FastAPI, HTTPException, Depends, Body, Header, Request
import os
import sys
import pathlib
from starlette.middleware import Middleware
from starlette.middleware.cors import CORSMiddleware
import pandas as pd
import math
import xml.etree.ElementTree as ET
import xmltodict
from io import StringIO

dname = os.path.dirname(os.path.abspath(__file__))
parent_dir = pathlib.Path(dname).parents[0]
main_folder = os.path.dirname(os.path.realpath(__file__))
folder_list = os.listdir(main_folder)
game_data_folder = os.path.join(parent_dir, 'pbp_snap_shot')
file_list = os.listdir(game_data_folder)


print('API Connected!')
# print('HELLO!')

# Create the FastAPI App   
app = FastAPI(
    title="Fast API Example",
    description="Example API",
    version="1.0"
)

app.add_middleware(
    CORSMiddleware,
    # allow_origins = ['http://localhost:3000', 'http://localhost:5173'],
    allow_origins = ['*'],
    allow_methods=['*'],
    allow_headers=['*']
)

# There are four API endpoints:
# /initial_folders/ - Fetches initial folders within the data pbp_snap_shot folder
# /folder_files/ - Fetches list of all files within a user defined folder (../inital_folders/ needed)
# /gleague_schedule/ - Fetches list G-League Schedule
# /get_file/ - Fetches user-defined file (../inital_folders/ & ../folder_files/ needed)


@app.get("/initial_folders/", tags=['initial_files'])
async def initial_folders(request: Request):
    inital_folds = [str(name.name) for name in os.scandir(game_data_folder) if name.is_dir()]
    # print(inital_folds)
    print('Initial Folders:', inital_folds)

    return {'total_records': '1', 'total_pages': '1', 'data' : {'initial_folders' : inital_folds}}

@app.get("/folder_files/", tags=['folder_files'])
async def folder_files(request: Request):
    folder = request.headers.get('folder')
    folder = os.path.join(game_data_folder, folder)
    
    files = [str(name.name) for name in os.scandir(folder) if not name.is_dir() and '.xml']
    print('Initial Folders:', folder, files)

    return {'total_records': '1', 'total_pages': '1', 'data' : {'files' : files}}



@app.get("/gleague_schedule/", tags=['gleague_schedule'])
async def gleague_schedule(request: Request):
    gleague_schedule = [str(name.name) for name in os.scandir(game_data_folder) if not name.is_dir() and '.xml' in str(name) and 'gleague_showcase_schedule' in str(name)]
    gleague_schedule = os.path.join(game_data_folder, gleague_schedule[0])
    
    with open(gleague_schedule, 'r', encoding='utf-8') as file:
        xml_file = file.read()

    game_info = pd.read_xml(StringIO(xml_file), xpath=".//Msg_game_info/Game_info").astype('str')
    home_team = pd.read_xml(StringIO(xml_file), xpath=".//Msg_game_info/Home_team").astype('str')
    visitor_team = pd.read_xml(StringIO(xml_file), xpath=".//Msg_game_info/Visitor_team").astype('str')
    tv_info = pd.read_xml(StringIO(xml_file), xpath=".//Msg_game_info/TV_Info").astype('str')
    radio_info = pd.read_xml(StringIO(xml_file), xpath=".//Msg_game_info/Radio_Info").astype('str')

    schedule_df = pd.concat([game_info,home_team,visitor_team, tv_info,radio_info], axis =1).to_dict(orient ='records')
    
    return {'total_records': '1', 'total_pages': '1', 'data' : {'game_schedule' : schedule_df}}




@app.get("/get_file/", tags=['testing'])
# This endpoint is to be used
async def initial_files(request: Request):
    
    # if re
    file_path = request.headers.get('file')


    if file_path == '':
        pass
    else:

        folder_path = request.headers.get('folder')
        # print(folder_path, file_path)
        file_path = folder_path + '/' + file_path
        file_path = os.path.join(game_data_folder, file_path)        

        with open(file_path, 'r', encoding='utf-8') as file:
            my_xml = file.read()


        file_dict = xmltodict.parse(my_xml)

        try:
            if 'schedule' in file_path:
                inner_root_tags = ['Game_info', 'Home_team', 'Visitor_team', 'TV_Info', 'Radio_Info']

                game_info = pd.read_xml(StringIO(my_xml), xpath=".//Msg_game_info/Game_info").astype('str').to_dict(orient ='records')
                home_team = pd.read_xml(StringIO(my_xml), xpath=".//Msg_game_info/Home_team").astype('str').to_dict(orient ='records')
                visitor_team = pd.read_xml(StringIO(my_xml), xpath=".//Msg_game_info/Visitor_team").astype('str').to_dict(orient ='records')
                tv_info = pd.read_xml(StringIO(my_xml), xpath=".//Msg_game_info/TV_Info").astype('str').to_dict(orient ='records')
                radio_info = pd.read_xml(StringIO(my_xml), xpath=".//Msg_game_info/Radio_Info").astype('str').to_dict(orient ='records')
                
                return {'total_records': '1', 'total_pages': '1', 'data' : {'game_info' : game_info, 'home_team' : home_team, 'visitor_team' : visitor_team, 'tv_info' : tv_info, 'radio_info' : radio_info}}

            elif 'game_info' in file_path:
                inner_root_tags = ['Game_info']

                game_info = pd.read_xml(StringIO(my_xml), xpath=".//Game_info").astype('str')
                home_team = pd.read_xml(StringIO(my_xml), xpath=".//Home_team").astype('str')
                visitor_team = pd.read_xml(StringIO(my_xml), xpath=".//Visitor_team").astype('str')

                return {'total_records': '1', 'total_pages': '1', 'data' : {'game_info' : game_info, 'home_team' : home_team, 'visitor_team' : visitor_team}}

            elif 'boxscore' in file_path:
                inner_root_tags = ['Player_stats']

                player_stats = pd.read_xml(StringIO(my_xml), xpath=".//Msg_boxscore/Player_stats").astype('str').to_dict(orient ='records')
                team_stats = pd.read_xml(StringIO(my_xml), xpath=".//Msg_boxscore/Team_stats").astype('str').to_dict(orient ='records')
                game_info = pd.read_xml(StringIO(my_xml), xpath=".//Game_info").astype('str').to_dict(orient ='records')
                period_time = pd.read_xml(StringIO(my_xml), xpath=".//Msg_score/Period_time").astype('str').to_dict(orient ='records')
                visitor_team_score = pd.read_xml(StringIO(my_xml), xpath=".//Msg_score/Visitor_team_score").astype('str').to_dict(orient ='records')
                home_team_score = pd.read_xml(StringIO(my_xml), xpath=".//Msg_score/Home_team_score").astype('str').to_dict(orient ='records')
                game_stats = pd.read_xml(StringIO(my_xml), xpath=".//Msg_score/Game_stats").astype('str').to_dict(orient ='records')

                try:
                    technical_fouls = pd.read_xml(StringIO(my_xml), xpath=".//Technical_Fouls/Technical_Foul").astype('str').to_dict(orient ='records')
                except:
                    technical_fouls = {}

                return {'total_records': '1', 'total_pages': '1', 'data' : {'player_stats' : player_stats, 'team_stats' : team_stats, 'game_info' : game_info, 'period_time' : period_time, 'visitor_team_score' : visitor_team_score, 'home_team_score' : home_team_score, 'game_stats' : game_stats, 'technical_fouls' : technical_fouls}}

            elif 'roster' in file_path:

                inner_root_tags = ['Msg_person_info']
                roster = pd.read_xml(StringIO(my_xml), xpath=".//Msg_person_info").astype('str').to_dict(orient ='records')
                roster_lineup = pd.read_xml(StringIO(my_xml), xpath=".//Msg_game_lineup").astype('str').to_dict(orient ='records')

                return {'total_records': '1', 'total_pages': '1', 'data' : {'roster' : roster, 'roster_lineup' : roster_lineup}}
    
                
            elif 'pbp' in file_path:
                event_pbp = pd.read_xml(StringIO(my_xml), xpath=".//Msg_play_by_play/Event_pbp").astype('str').to_dict(orient ='records')
                return {'total_records': '1', 'total_pages': '1', 'data' : {'event_pbp' : event_pbp}}
                
            else:

                return {'Error!'}
        except:
            print(file_dict)
            print(file_path)
            error_type = str(sys.exc_info()[0])
            error_value = str(sys.exc_info()[1])
            error_line_number = sys.exc_info()[2].tb_lineno

            print("Errors occurred:")
            print("Error type: " + error_type)
            print("Error value: " + error_value)
            print("Error line number: " + str(error_line_number))


            return {'Error!'}
        

    return ('API Pinged') 

