from flask import Flask, render_template, send_from_directory
from pathlib import Path
import json

app = Flask(__name__)

@app.route("/")
def accueil():

	etapes = []
	distance_totale = 0
	duree_totale = 0
	for dossier in sorted(Path("data").glob("Etape_*")):
		with open(dossier / "chapitre.json", "r", encoding="utf-8") as f:
			chapitre = json.load(f)
		chapitre["id"] = dossier.name
		chapitre["trace"] = f"/data/{dossier.name}/trace.geojson"
		distance_totale += chapitre.get("distance_navionics", 0)
		duree_totale += chapitre.get("duree_h", 0)
		etapes.append(chapitre)
	return render_template(
		"index.html",
		etapes=etapes,
		distance_totale=round(distance_totale, 1),
		duree_totale=round(duree_totale, 1)
)



@app.route("/data/<etape>/<path:fichier>")
def servir_data(etape, fichier):
    return send_from_directory(f"data/{etape}", fichier)
    
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
