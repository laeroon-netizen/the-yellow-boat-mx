// ======================================================
// CONFIGURATION MAPBOX
// ======================================================

mapboxgl.accessToken = 'pk.eyJ1IjoibGFlcm9vbiIsImEiOiJjbXJ6MXl6NHowZjZzMnpzNjhieGpjc2lrIn0.ry2hODkg-KZu33FudCibxg';

const map = new mapboxgl.Map({

    container: 'map',

    style: 'mapbox://styles/laeroon/cmsc9azyv000501sa4c6d99kg',

    center: [-3.0, 47.7],

    zoom: 7,

    pitch: 40,

    bearing: 0
});

map.addControl(new mapboxgl.NavigationControl());


// ======================================================
// VARIABLES GLOBALES
// ======================================================

const TRACES = {};

const panel = document.getElementById("bottom-panel");


// ======================================================
// CHARGEMENT DE LA CARTE
// ======================================================

map.on("load", async () => {

    console.log("Carte chargée");
    await initialiserTraces();

});


// ======================================================
// CHARGEMENT DE TOUTES LES TRACES
// ======================================================

async function initialiserTraces(){

    const bounds = new mapboxgl.LngLatBounds();


    for(const etape of ETAPES){
		

        const geojson = await fetch(etape.trace)
            .then(response => response.json());

		console.log("TRACE CHARGEE :", etape.id);
        // stockage local
        TRACES[etape.id] = geojson;

        // création source

        map.addSource(etape.id, {

            type:"geojson",

            data:geojson

        });

        // création ligne

        map.addLayer({

            id:etape.id,

            type:"line",

            source:etape.id,

            layout:{

                "line-cap":"round",

                "line-join":"round"

            },

            paint:{

                "line-color":"#888888",

                "line-width":2,

                "line-opacity":0.45,

                "line-dasharray":[2,2]

            }

        });



        // calcul zoom global

        geojson.features[0].geometry.coordinates.forEach(coord=>{

            bounds.extend(coord);

        });


    }


    // zoom sur tout le voyage

    map.fitBounds(bounds,{

        padding:60

    });

}



// ======================================================
// CHARGEMENT D'UNE ETAPE
// ======================================================


async function chargerEtape(id){


    afficherTrace(id);


    zoomSurTrace(id);


    ouvrirPanel();


    await afficherChapitre(id);


}



// ======================================================
// MISE EN AVANT D'UNE TRACE
// ======================================================


function afficherTrace(id){


    ETAPES.forEach(etape=>{


        map.setPaintProperty(

            etape.id,

            "line-color",

            "#888888"

        );


        map.setPaintProperty(

            etape.id,

            "line-width",

            2

        );


        map.setPaintProperty(

            etape.id,

            "line-opacity",

            0.35

        );


        map.setPaintProperty(

            etape.id,

            "line-dasharray",

            [2,2]

        );


    });



    // trace sélectionnée

    map.setPaintProperty(

        id,

        "line-color",

        "#FFD400"

    );


    map.setPaintProperty(

        id,

        "line-width",

        5

    );


    map.setPaintProperty(

        id,

        "line-opacity",

        1

    );


    map.setPaintProperty(

        id,

        "line-dasharray",

        [1,0]

    );


    // devant les autres

    map.moveLayer(id);


}



// ======================================================
// ZOOM SUR UNE NAVIGATION
// ======================================================


function zoomSurTrace(id){


    const bounds = new mapboxgl.LngLatBounds();


    const coords =
        TRACES[id].features[0].geometry.coordinates;



    coords.forEach(coord=>{

        bounds.extend(coord);

    });



    map.fitBounds(bounds,{

        padding:80,

        duration:1500

    });


}



// ======================================================
// PANNEAU INFERIEUR
// ======================================================


function ouvrirPanel(){

    panel.className="panel-small";

}



function agrandirPanel(){

    panel.className="panel-large";

}



function fermerPanel(){

    panel.className="panel-closed";

}



// ======================================================
// CHARGEMENT DU JOURNAL
// ======================================================


async function afficherChapitre(id){


    const chapitre = await fetch(

        `/data/${id}/chapitre.json`

    )
    .then(response=>response.json());



    document.getElementById("titreEtape").innerHTML =
        chapitre.titre;



    document.getElementById("infosEtape").innerHTML =

        `${chapitre.distance_nm} NM • ${chapitre.duree_h} h`;



    document.getElementById("resumeEtape").innerHTML =

        chapitre.resume.replace(/\n/g, "<br>")|| "";



    afficherPhotos(id,chapitre);


}



// ======================================================
// PHOTOS
// ======================================================


function afficherPhotos(id,chapitre){


    const galerie =
        document.getElementById("galeriePhotos");


    galerie.innerHTML="";



    if(!chapitre.photos){

        return;

    }



    chapitre.photos.forEach(photo=>{


        const img=document.createElement("img");



        img.src =
            `/data/${id}/photos/${photo}`;



		img.onclick=()=>{

			ouvrirLightbox(img.src);

		};



        galerie.appendChild(img);


    });


}



// ======================================================
// LIGHTBOX
// ======================================================


const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const closeLightbox = document.getElementById("close");


function ouvrirLightbox(image){

    lightbox.style.display="flex";

    lightboxImage.src=image;

}


function fermerLightbox(){

    lightbox.style.display="none";

    lightboxImage.src="";

}


closeLightbox.onclick = fermerLightbox;


// clic en dehors de la photo pour fermer

lightbox.onclick = (event)=>{

    if(event.target === lightbox){

        fermerLightbox();

    }

};


// ======================================================
// CLIC SUR LES ETAPES
// ======================================================


document.querySelectorAll(".chapitre").forEach(chapitre=>{


    chapitre.addEventListener("click",()=>{


        chargerEtape(

            chapitre.dataset.id

        );


    });


});



// ======================================================
// CLIC SUR LA POIGNEE DU PANNEAU
// ======================================================


document.getElementById("panel-handle")
.addEventListener("click",()=>{


    if(panel.className==="panel-small"){


        agrandirPanel();


    }

    else{


        ouvrirPanel();


    }


});
