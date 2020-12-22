#pip install jpype1
#pip install konlpy 필요
import base64
import sys
from konlpy.tag import Komoran
komoran = Komoran()
 
#komoran.morphs    #형태소 분석
#komoran.nouns     #명사 분석
#komoran.pos    #형태소 분석 태깅

result = komoran.pos(sys.argv[1])
result = str(result)
print(base64.b64encode(result.encode('utf-8')))