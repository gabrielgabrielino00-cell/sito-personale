import json
import urllib.request

uid = "43570bd2d48f48b6aafb8adbb04e346d"
url = f"https://sketchfab.com/i/models/{uid}"
with urllib.request.urlopen(url) as f:
    data = json.load(f)

out = f"C:/Users/chiar/hero-3d/scripts/model_{uid}.json"
with open(out, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2)
print("saved", out)
print("keys", list(data.keys()))
print("file keys", list(data["files"][0].keys()))