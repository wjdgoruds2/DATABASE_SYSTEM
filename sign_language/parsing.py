import xml.etree.ElementTree as elemTree
import pymysql

conn = pymysql.connect(host='localhost', user='root', password='6725',db='sl', charset='utf8')



parser = elemTree.XMLParser(encoding='utf-8')
tree = elemTree.parse('response.xml', parser=parser)
item = tree.findall('item')
count=1000
for item in tree.findall('./item'):
    abdesc = item.find('abstractDesc').text
    video = item.find('subDescription').text
    firstidx = video.index(":")
    lastidx = video.index("|")
    videourl = video[firstidx+1:lastidx]
    imgurl = video[video.index('지')+2:video.index('jpg')+3]
    try :
        pos =  abdesc[abdesc.index("[")+1:abdesc.index("]")]
    except :
        pos = ""
    title = item.find('title').text
    try:
        with conn.cursor() as curs:
            sql = 'insert into signlanguage values(%s,%s,%s,%s,%s,%s)'
            curs.execute(sql,(count,title,videourl,abdesc,imgurl,pos))
        conn.commit()
    finally:
        count+=1
