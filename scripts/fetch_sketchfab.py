import json
import re
import urllib.request

uid = "43570bd2d48f48b6aafb8adbb04e346d"
url = f"https://sketchfab.com/i/models/{uid}"
with urllib.request.urlopen(url) as f:
    data = json.load(f)

files = data["files"][0]
print("osgjsUrl", files.get("osgjsUrl"))
print("modelSize", files.get("modelSize"))

s = json.dumps(data)
for m in re.findall(r"https://[^\"']+", s):
    low = m.lower()
    if any(x in low for x in ["glb", "gltf", "archive", "download", "zip"]):
        print(m)