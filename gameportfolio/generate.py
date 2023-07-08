def generate_html(data):
    html = """
    <html>
        <head>
            <title>My Portfolio</title>
            <style>
                .masthead {
                  padding-top:    1rem;
                  padding-bottom: 1rem;
                  margin-bottom: 3rem;
                }
                .masthead-title {
                  margin-top: 0;
                  margin-bottom: 0;
                  color: #505050;
                }
                .masthead-title a {
                  color: #505050;
                }
                .masthead-title small {
                  font-size: 75%;
                  font-weight: 400;
                  color: #c0c0c0;
                  letter-spacing: 0;
                }
                body {
                    font-family: Arial, sans-serif;
                    text-align: center;
                }
                h1 {
                    font-size: 36px;
                    margin-top: 50px;
                }
                li {
                    margin-top: 50px;
                    display: inline-block;
                    text-align: left;
                    width: 500px;
                }
                h2 {
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                p {
                    font-size: 16px;
                    margin-bottom: 20px;
                }
                a {
                    color: blue;
                }
                strong {
                    font-weight: bold;
                }
                .video-container {
                    position: relative;
                    padding-bottom: 56.25%;
                    padding-top: 30px;
                    height: 0;
                    overflow: hidden;
                }
                .video-container iframe {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                img {
                  width: 500px;
                  height: 314px;
                  object-fit: cover;
                }
            </style>
        </head>
        <body>
            <div class="masthead">
                <div class="container">
                  <h3 class="masthead-title">
                    <a href="https://adrianogil.github.io/" title="Home">GilLabs</a>
                    <small>{ GilLabs }</small>
                  </h3>
                </div>
            </div>
            <h1>My Portfolio</h1>
            <ul>
    """
    
    for game in data["games"]:
        html += f"""
                <li>
                    <h2>{game["title"]} ({game["year"]})</h2>
        """

        if "youtube_embedded_url" in game:
            html += f"""
                    <div class="video-container">
                        <iframe src="{game["youtube_embedded_url"]}" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
            """
        elif "img" in game:
            html += f"""
                        <img src="{game["img"]}" />
            """

        if "url" in game:
            html+= f"""
                <p><strong>URL:</strong> <a href='{game['url']}'>{game['url']}</a></p>
            """

        html+= f"""
                    <p>{game["description"]}</p>
                    <p><strong>My role:</strong> {game["my_role"]}</p>
                    <p><strong>Platforms:</strong> {", ".join(game["platforms"])}</p>
                    <p><strong>Tags:</strong> {", ".join(game["tags"])}</p>
                </li>
        """
    
    html += """
            </ul>
        </body>
    </html>
    """
    
    with open("portfolio.html", "w") as file:
        file.write(html)

data = {
    "games": [
        {
            "title": "LiveOps Project: Popup Tool",
            "year": "2022",
            "img": "Popup_Zooba.jpeg",
            "description": "A LiveOps/Monetization tool project to show dinamically popups in Wildlife Studios games. Whenever a product manager wanted to deploy a new offer in game, it would only update remotely the popup html.",
            "my_role": "I implemented an Unity3D SDK that allowed games to show dynamic popups. This SDK was incorporated in games such as Zooba, War Machines, Sniper3D",
            "platforms": ["Android", "iOS"],
            "tags": ["#tools", "#unity3d", "#unityplugins"]
        },
        {
            "title": "Kuarup",
            "year": "2017",
            "img": "kuarup.png",
            "url": "https://play.google.com/store/apps/details?id=com.pxlsquadgames.kuarup",
            "description": "An Unity3D mobile match-3-like puzzle Game for GGJ16.",
            "my_role": "Worked in main gameplay features, UI, PCG algorithms and dotween-based animations. <a href='http://adrianogil.github.io/blog/2016/01/global-game-jam-2016/'> See more </a>",
            "platforms": ["Android"],
            "tags": ["#unity3d", "#match-3", "#puzzle"]
        },
        {
            "title": "VR Gallery",
            "year": "2017",
            "img": "vrgallery2.png",
            "url": "https://www.oculus.com/experiences/gear-vr/1113617725394318/",
            "description": "A GearVR application to view images and watch video.  It supports 2D and 3D video, 3D spacial sound, subtitles, and photo galleries.",
            "my_role": "I worked in different tasks like UI, shaders, performance analysis and debugging",
            "platforms": ["Samsung GearVR", "Android"],
            "tags": ["#unity3d", "#virtualreality", "#gearvr"]
        },
        {
            "title": "Rio360",
            "year": "2016",
            "img": "rio_360.png",
            "url": "https://www.oculus.com/experiences/gear-vr/1105507662843899/",
            "description": "A GearVR application to watch 360 videos and navigate through a low-poly depiction of Rio de Janeiro's landmarks.",
            "my_role": "Worked with gaze implementation, algorithms to allow a smooth user locomotion, editor tools and shader programming.",
            "platforms": ["Samsung GearVR", "Android"],
            "tags": ["#unity3d", "#virtualreality", "#gearvr"]
        },
        {
            "title": "The Battles Untold",
            "year": "2015",
            "img": "TheBattlesUntold.png",
            "url": "https://matchola.itch.io/battlesuntold",
            "description": "A local multiplayer brawler in which the main characters are from famous public domain work, as Dracula and Merlin for instance",
            "my_role": "I worked on AI implementation: bots movement and general behaviors and strategies.",
            "platforms": ["macOS", "Windows"],
            "tags": ["#game_ai", "#unity3d", "#2dgame"]
        },
        {
            "title": "Woody Endless Summer",
            "year": "2014",
            "youtube_embedded_url": "https://www.youtube.com/embed/OWez0jlGOjU",
            "description": "A time-based sidescroller infinite runner implemented in Unity3D targetting mobile platforms.",
            "my_role": "My contributions to this project were developping a chunk-based procedural generation algorithm, difficulty-level curves, few gameplay mechanics, UI implementation and performance improvements.",
            "platforms": ["Android", "iOS", "WindowsPhone"],
            "tags": ["#pcg", "#unity3d", "#2dgame", "#infinity_runner"]
        },
        {
            "title": "Soccer Button",
            "year": "2013",
            "url": "https://play.google.com/store/apps/details?id=br.org.sidia.futebol",
            "youtube_embedded_url": "https://www.youtube.com/embed/YjHnDKFOgbQ",
            "description": "A turn-based multiplayer Android game implemented in Unity 4.3.",
            "my_role": "I was the tech lead of this project, so I was responsible for architecture and software components definition, implementation of state machine-based gameplay, networking components and several Android plugins for integration with Samsung APIs (multiplayer, Ads, in-app, ...)",
            "platforms": ["Android"],
            "tags": ["#multiplayer", "#unity3d", "#3dgame"]
        },
        {
            "title": "QDominoes",
            "year": "2012",
            "url": "https://www.ceteli.ufam.edu.br/index.php/portfolio/produtos/apps-dispositivos-moveis/31-portfolio/produtos/aplicativosdispositivosmoveis/100-qdominoes",
            "img": "qdominoes.png",
            "description": "A Dominoes game for Symbian/Meego platforms using Qt",
            "my_role": "I worked with main gameplay features, UI, debugging, and implemented some AI bots",
            "platforms": ["Symbian"],
            "tags": ["#Qt"]
        },
        {
            "title": "Cyber Eddy",
            "year": "2012",
            "url": "https://www.ceteli.ufam.edu.br/index.php/portfolio/produtos/apps-dispositivos-moveis/31-portfolio/produtos/aplicativosdispositivosmoveis/98-cybereddy",
            "img": "cyber_eddy.png",
            "description": "A cocos2d asteroid-like game",
            "my_role": "I worked with gameplay features, UI and debugging",
            "platforms": ["Symbian"],
            "tags": ["#Qt"]
        },
        {
            "title": "Saci Jump",
            "year": "2012",
            "url": "https://www.ceteli.ufam.edu.br/index.php/portfolio/produtos/apps-dispositivos-moveis/31-portfolio/produtos/aplicativosdispositivosmoveis/94-sacijump",
            "img": "sacijump.png",
            "description": "A Qt DoodleJump-like game that features Saci, a famous character from brazilian folklore",
            "my_role": "I worked with gameplay features, UI and debugging",
            "platforms": ["Symbian"],
            "tags": ["#Qt"]
        },
        {
            "title": "Eddy",
            "year": "2011",
            "youtube_embedded_url": "https://www.youtube.com/embed/PXZ6mPQu8DY",
            "url": "https://www.ceteli.ufam.edu.br/index.php/portfolio/produtos/apps-dispositivos-moveis/31-portfolio/produtos/aplicativosdispositivosmoveis/103-eddy",
            "description": "An educational puzzle Qt game that addressed the importance of selective waste collection.",
            "my_role": "I worked with box2d implementations for Qt",
            "platforms": ["Symbian"],
            "tags": ["#Qt"]
        }
    ]
}

generate_html(data)
