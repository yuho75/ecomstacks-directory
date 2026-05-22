import urllib.request

urls = {
    "landing.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sX2EwYTRiMTAwNzI1ODRmM2U4YTMyNDE2Zjg0ZmYyYWI3EgsSBxDIu-HknR0YAZIBIwoKcHJvamVjdF9pZBIVQhMyMjI0NTQwMjQ4MTc5MjY4MzI3&filename=&opi=89354086",
    "detail.html": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzE4MWRiMzViYTZhNjQzMzg5ZDRjMmVhZGIwNDQ2MThjEgsSBxDIu-HknR0YAZIBIwoKcHJvamVjdF9pZBIVQhMyMjI0NTQwMjQ4MTc5MjY4MzI3&filename=&opi=89354086"
}

for filename, url in urls.items():
    print(f"Downloading {filename}...")
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
        )
        with urllib.request.urlopen(req) as response:
            content = response.read()
            with open(filename, "wb") as f:
                f.write(content)
        print(f"Successfully downloaded {filename}")
    except Exception as e:
        print(f"Error downloading {filename}: {e}")
