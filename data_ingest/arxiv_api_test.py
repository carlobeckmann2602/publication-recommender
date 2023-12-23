import urllib, urllib.request
import xml.etree.ElementTree as ET

url = 'https://export.arxiv.org/api/query?search_query=all:2023-12-21&sortBy=submittedDate&sortOrder=descending&start=0&max_results=25'
print(url)
arxiv_id =None
pub_date=None
with urllib.request.urlopen(url) as response:
    if response.status == 200:
        content = response.read().decode('utf-8')
        xml_tag_prefix = "{http://www.w3.org/2005/Atom}"
        xml_root = ET.fromstring(content)
        for entry in xml_root.findall(xml_tag_prefix+'entry'):
            # find arxiv id
            arxiv_id = entry.find(xml_tag_prefix+'id').text
            arxiv_id = arxiv_id.replace("http://arxiv.org/abs/", "")
            if "v" in arxiv_id:
                arxiv_id = arxiv_id[:-2]
            # find published and updated timestamps
            pub_date = entry.find(xml_tag_prefix+'published').text
            print(arxiv_id)
            print(pub_date)
        print(content)