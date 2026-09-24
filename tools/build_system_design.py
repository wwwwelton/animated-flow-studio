"""Rebuild original vector symbols, manifest and embedded catalog (stdlib only)."""
from pathlib import Path
import json
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/system-design'

def path(d):
    return f'<path d="{d}"/>'

def rect(x, y, w, h, r=2):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}"/>'

def circle(x, y, r):
    return f'<circle cx="{x}" cy="{y}" r="{r}"/>'

def label(t, x=32, y=36, size=10):
    return f'<text x="{x}" y="{y}" text-anchor="middle" font-family="Arial,sans-serif" font-size="{size}" font-weight="700" fill="currentColor" style="fill:currentColor" stroke="none">{escape(t)}</text>'

def arrow(x=7, y=32, end=57):
    return path(f'M{x} {y}H{end}m-5 -5 5 5-5 5')

def db(x=12, y=10, w=40, h=44):
    return f'<ellipse cx="{x+w/2}" cy="{y+6}" rx="{w/2}" ry="6"/>' + path(f'M{x} {y+6}V{y+h-6}C{x} {y+h+2} {x+w} {y+h+2} {x+w} {y+h-6}V{y+6}M{x} {y+h/2}C{x} {y+h/2+8} {x+w} {y+h/2+8} {x+w} {y+h/2}')

def server(x=14, y=8, w=36, h=48):
    return rect(x,y,w,h,4)+path(f'M{x} {y+h/3}H{x+w}M{x} {y+2*h/3}H{x+w}')+''.join(circle(x+7,y+(i+.5)*h/3,1) for i in range(3))

def clock():
    return circle(32,32,22)+path('M32 17V32L43 39')

def network():
    return path('M16 18L48 18L32 48ZM16 18L32 32L48 18M32 32V48')+circle(16,18,7)+circle(48,18,7)+circle(32,48,7)

def queue():
    return path('M8 16H56M8 48H56')+''.join(rect(x,23,12,18) for x in (10,26,42))

def cache():
    return rect(9,9,46,46,7)+path('M35 15L21 34H31L28 49L43 28H33Z')

def tag():
    return path('M8 16H39L57 32L39 48H8Z')+circle(43,32,3)

def shield():
    return path('M32 6L53 15V32Q52 48 32 58Q12 48 11 32V15Z')

def badge(base, text):
    return base+rect(33,39,29,21,4)+label(text,47,53,9)

rows=[]
def add(num, key, name, en, group, kind, drawing):
    rows.append(dict(id=key,label=name,english=en,category=group,kind=kind,sourceTerms=[num],svg=drawing))

C='Clientes e infraestrutura';D='Dados e armazenamento';K='Cache';S='Sistemas distribuídos';M='Mensageria';R='Resiliência e desempenho'
add(1,'client','Cliente','Client',C,'component',rect(7,10,50,34)+path('M24 44V53M40 44V53M18 54H46M8 37H56'))
add(2,'server','Servidor','Server',C,'component',server())
add(3,'load-balancer','Load balancer','Load Balancer',C,'component',rect(6,24,16,16)+path('M22 32H34V12H45M34 32H45M34 32V52H45')+''.join(rect(45,y,13,12) for y in (6,26,46)))
add(4,'horizontal-scaling','Escala horizontal','Horizontal Scaling',C,'pattern',''.join(server(x,19,14,27) for x in (5,25,45))+path('M7 54H57m-4 -4 4 4-4 4M7 54l4-4m-4 4 4 4'))
add(5,'vertical-scaling','Escala vertical','Vertical Scaling',C,'pattern',server(17,17,30,34)+path('M32 14V3m-5 5 5-5 5 5M32 54V61m-5-5 5 5 5-5'))
add(6,'stateless-service','Serviço stateless','Stateless Service',C,'component',rect(17,15,30,34,5)+arrow(3,32,14)+arrow(50,32,61)+label('{}'))
add(7,'stateful-service','Serviço stateful','Stateful Service',C,'component',server(7,10,28,40)+db(36,29,23,28))
add(8,'api-gateway','API gateway','API Gateway',C,'component',rect(20,7,24,50,3)+arrow(3,32,17)+arrow(47,32,61)+label('API',32,34,9))
add(9,'reverse-proxy','Reverse proxy','Reverse Proxy',C,'component',rect(23,10,18,44)+path('M3 23H19m-5-5 5 5-5 5M45 23H60M60 41H45m5-5-5 5 5 5M19 41H3'))
add(10,'cdn','CDN','Content Delivery Network',C,'component',circle(32,32,14)+path('M18 32H46M32 18Q19 32 32 46Q45 32 32 18M9 9L22 22M55 9L42 22M9 55L22 42M55 55L42 42')+''.join(rect(x,y,10,10) for x,y in ((3,3),(51,3),(3,51),(51,51))))
add(11,'dns','DNS','Domain Name System',C,'component',circle(32,26,19)+path('M13 26H51M32 7Q15 26 32 45Q49 26 32 7')+rect(12,44,40,16)+label('DNS',32,56))
add(12,'tls','SSL / TLS','SSL/TLS',C,'component',shield()+rect(23,28,18,17)+path('M26 28V22a6 6 0 0 1 12 0V28')+circle(32,36,1))
add(13,'database','Banco de dados','Database',D,'component',db())
add(14,'sql-database','Banco SQL','SQL Database',D,'component',db()+label('SQL',32,38,11))
add(15,'nosql-database','Banco NoSQL','NoSQL Database',D,'component',db()+label('{ }',32,39,16))
add(16,'schema','Schema','Schema',D,'concept',rect(9,9,46,46)+path('M9 21H55M9 33H55M9 45H55M23 9V55'))
add(17,'primary-key','Chave primária','Primary Key',D,'concept',circle(19,25,10)+path('M29 25H56V34M47 25V32')+label('PK',31,53,12))
add(18,'foreign-key','Chave estrangeira','Foreign Key',D,'concept',circle(16,22,8)+path('M24 22H48V29M39 22V28M15 40V52H45m-5-5 5 5-5 5')+label('FK',48,42,10))
add(19,'index','Índice','Index',D,'concept',rect(7,7,35,48)+path('M14 17H33M14 26H29M14 35H25')+circle(42,42,11)+path('M50 50L60 60'))
add(20,'acid','ACID','ACID',D,'concept',shield()+label('ACID',32,34,11)+path('M23 43l6 6 13-13'))
add(21,'transaction','Transação','Transaction',D,'pattern',rect(9,18,16,27)+rect(39,18,16,27)+path('M17 12H48m-5-5 5 5-5 5M48 52H17m5-5-5 5 5 5')+label('✓',32,37,12))
add(22,'replication','Replicação','Replication',D,'pattern',db(5,7,23,29)+db(37,30,23,29)+path('M33 13H48V25m-4-4 4 4 4-4M29 49H17V40'))
add(23,'sharding','Sharding','Sharding / Partitioning',D,'pattern',db(20,3,24,22)+path('M32 25V33M11 33H53M11 33V39M32 33V39M53 33V39')+''.join(db(x,39,16,21) for x in (3,24,45)))
add(24,'shard-key','Chave de shard','Shard Key',D,'concept',tag()+label('#',25,37,20))
add(25,'hot-partition','Partição quente','Hot Partition',D,'concept',db(4,19,20,36)+db(39,19,20,36)+path('M31 7Q47 23 34 35Q20 39 26 25Q34 22 31 7Z'))
add(26,'read-replica','Réplica de leitura','Read Replica',D,'component',db(7,8,36,44)+path('M27 43Q42 27 59 43Q43 59 27 43Z')+circle(43,43,5))
add(27,'wal','Write-ahead log','Write-Ahead Log (WAL)',D,'component',rect(7,7,28,45)+path('M13 17H29M13 25H29M13 33H24')+db(39,30,22,28)+arrow(31,20,54))
add(28,'cache','Cache','Cache',K,'component',cache())
add(29,'cache-aside','Cache-aside','Cache-Aside',K,'pattern',rect(23,5,18,16)+rect(4,42,20,17)+db(42,36,18,25)+path('M26 21L14 39m-1-6 1 6 6-1M38 21L49 33M24 50H38'))
add(30,'cache-eviction','Remoção do cache','Cache Eviction',K,'pattern',rect(7,8,37,46)+path('M14 17H33M14 25H33')+arrow(28,41,60))
add(31,'ttl','TTL','Time To Live',K,'concept',clock()+rect(33,42,28,18)+label('TTL',47,55,9))
add(32,'cache-stampede','Cache stampede','Cache Stampede',K,'concept',rect(39,21,20,23)+path('M43 32H54M4 8L35 24m-6-6 6 6-8 1M3 32H34m-5-5 5 5-5 5M4 56L35 40m-8-1 8 1-6 6'))
add(33,'object-storage','Object storage','Object Storage',D,'component',path('M11 17Q32 7 53 17L49 51Q32 61 15 51ZM11 17Q32 27 53 17')+rect(24,31,16,14)+path('M24 31l8-5 8 5M32 31V45'))
add(34,'blob-storage','Blob storage','Blob Storage',D,'component',path('M11 17Q32 7 53 17L49 51Q32 61 15 51ZM11 17Q32 27 53 17')+label('010',32,39,10)+label('101',32,50,10))
add(35,'distributed-system','Sistema distribuído','Distributed System',S,'pattern',network())
add(36,'cap','Teorema CAP','CAP Theorem',S,'concept',path('M32 8L7 54H57Z')+label('C',32,23)+label('A',18,49)+label('P',47,49))
add(37,'consistency','Consistência','Consistency',S,'concept',db(4,12,23,36)+db(37,12,23,36)+path('M29 27H35M29 34H35'))
add(38,'availability','Disponibilidade','Availability',R,'concept',circle(32,32,24)+path('M15 33H23L28 21L36 45L41 33H51'))
add(39,'eventual-consistency','Consistência eventual','Eventual Consistency',S,'concept',db(4,7,22,32)+db(38,7,22,32)+path('M27 24H36m-4-4 4 4-4 4')+circle(32,48,12)+path('M32 41V48L39 51'))
add(40,'strong-consistency','Consistência forte','Strong Consistency',S,'concept',db(4,9,22,36)+db(38,9,22,36)+path('M27 26H36M27 32H36M23 51l7 7 15-15'))
add(41,'linearizability','Linearizabilidade','Linearizability',S,'concept',arrow(5,49,59)+path('M14 44V18M32 44V11M50 44V26')+circle(14,18,5)+circle(32,11,5)+circle(50,26,5))
add(42,'network-partition','Partição de rede','Network Partition',S,'concept',circle(13,20,8)+circle(51,20,8)+circle(13,48,8)+circle(51,48,8)+path('M13 28V40M51 28V40M22 20H27M38 20H42M33 5L28 24L36 35L29 59'))
add(43,'consensus','Consenso','Consensus',S,'pattern',network()+rect(23,25,18,16)+path('M27 32l4 4 6-8'))
add(44,'quorum','Quórum','Quorum',S,'concept',''.join(circle(x,21,8) for x in (12,32,52))+path('M8 21l3 3 5-6M28 21l3 3 5-6')+label('2 / 3',32,51,16))
add(45,'consistent-hashing','Hash consistente','Consistent Hashing',S,'pattern',circle(32,32,22)+''.join(rect(x,y,10,10) for x,y in ((27,5),(49,27),(27,49),(5,27)))+label('#',32,38,20))
add(46,'leader-election','Eleição de líder','Leader Election',S,'pattern',path('M22 8l5 6 5-8 5 8 5-6-3 13H25Z')+rect(23,25,18,14)+path('M32 39V47M12 47H52')+rect(5,47,14,13)+rect(45,47,14,13))
add(47,'split-brain','Split brain','Split Brain',S,'concept',path('M5 11l5 6 6-9 6 9 5-6-3 15H8ZM37 11l5 6 6-9 6 9 5-6-3 15H40ZM32 6V58')+rect(7,35,18,19)+rect(39,35,18,19))
add(48,'vector-clock','Relógio vetorial','Vector Clock',S,'concept',rect(5,12,54,40)+path('M23 12V52M41 12V52')+label('2',14,36,16)+label('1',32,36,16)+label('3',50,36,16))
add(49,'clock-skew','Desvio de relógio','Clock Skew',S,'concept',circle(18,26,14)+circle(47,41,14)+path('M18 17V26H25M47 32V41L40 46M38 9H54m-4-4 4 4-4 4'))
add(50,'idempotency','Idempotência','Idempotency',S,'pattern',path('M12 24a22 22 0 1 1 0 18M12 24V10M12 24H26')+label('1×',34,38,16))
add(51,'idempotency-key','Chave idempotente','Idempotency Key',S,'concept',tag()+label('1×',25,38,16))
add(52,'message-queue','Fila de mensagens','Message Queue',M,'component',queue())
add(53,'producer','Produtor','Producer',M,'component',rect(5,15,29,34)+path('M12 32H26M19 25V39')+arrow(38,32,60))
add(54,'consumer','Consumidor','Consumer',M,'component',arrow(4,32,24)+rect(30,15,29,34)+path('M37 33l6 6 10-14'))
add(55,'at-most-once','At-most-once','At-Most-Once Delivery',M,'pattern',rect(6,18,52,28)+label('≤ 1',32,38,20))
add(56,'at-least-once','At-least-once','At-Least-Once Delivery',M,'pattern',rect(6,18,52,28)+label('≥ 1',32,38,20))
add(57,'exactly-once','Exactly-once','Exactly-Once Delivery',M,'pattern',rect(6,18,52,28)+label('= 1',32,38,20))
add(58,'dead-letter-queue','Dead-letter queue','Dead-Letter Queue (DLQ)',M,'component',queue()+rect(33,36,28,25)+path('M42 43l10 10M52 43L42 53'))
add(59,'pub-sub','Pub / Sub','Publish–Subscribe',M,'pattern',circle(26,32,10)+path('M3 32H16M36 32H41V10H50M41 32H50M41 32V54H50')+''.join(rect(50,y,11,10) for y in (5,27,49)))
add(60,'event-stream','Event streaming','Event Streaming',M,'component',path('M4 13H58M4 51H58')+arrow(4,32,60)+''.join(rect(x,24,10,16) for x in (9,26,43)))
add(61,'backpressure','Backpressure','Backpressure',M,'pattern',path('M6 9L25 27V51L39 57V27L58 9Z')+path('M17 36H3m5-5-5 5 5 5M47 36H61m-5-5 5 5-5 5'))
add(62,'websocket','WebSocket','WebSocket',M,'component',rect(4,14,12,36)+rect(48,14,12,36)+arrow(20,24,44)+path('M44 41H20m5-5-5 5 5 5'))
add(63,'sse','Server-sent events','Server-Sent Events (SSE)',M,'component',server(4,15,17,36)+rect(49,15,11,36)+arrow(25,22,45)+arrow(25,33,45)+arrow(25,44,45))
add(64,'long-polling','Long polling','Long Polling',M,'pattern',path('M8 8V56M56 8V56')+arrow(9,16,53)+path('M56 27H33V49H9m5-5-5 5 5 5')+circle(24,32,9)+path('M24 26V32H29'))
add(65,'latency','Latência','Latency',R,'metric',clock()+path('M25 3H39M32 3V10M48 10l6-5'))
add(66,'throughput','Throughput','Throughput',R,'metric',path('M8 8V56H57')+rect(15,39,8,12)+rect(29,28,8,23)+rect(43,14,8,37))
# Availability appears twice in the supplied PDF: keep one reusable component.
next(r for r in rows if r['id']=='availability')['sourceTerms'].append(67)
add(68,'spof','Ponto único de falha','Single Point of Failure (SPOF)',R,'concept',path('M32 22V40M10 40H54')+rect(22,4,20,18)+rect(3,40,14,18)+rect(25,40,14,18)+rect(47,40,14,18)+path('M28 9l8 8M36 9l-8 8'))
add(69,'redundancy','Redundância','Redundancy',R,'pattern',server(6,14,20,40)+server(38,14,20,40)+path('M16 10V5H48V10M26 34H38'))
add(70,'circuit-breaker','Circuit breaker','Circuit Breaker',R,'component',path('M3 39H19M45 39H61M21 36L42 17')+circle(20,39,3)+circle(44,39,3))
add(71,'timeout','Timeout','Timeout',R,'pattern',clock()+rect(35,36,26,25)+path('M42 43l12 11M54 43L42 54'))
add(72,'retry','Retry','Retry',R,'pattern',path('M13 23a22 22 0 1 1 0 19M13 23V8M13 23H28')+arrow(23,33,46))
add(73,'exponential-backoff','Backoff exponencial','Exponential Backoff',R,'pattern',path('M7 9V56H58M13 50H22V46H32V37H42V18H54')+circle(22,46,2)+circle(32,37,2)+circle(42,18,2))
add(74,'rate-limiter','Rate limiter','Rate Limiting',R,'component',path('M8 11H56L40 30V51L24 57V30Z')+path('M24 17H40M24 22H40'))
add(75,'load-shedding','Load shedding','Load Shedding',R,'pattern',arrow(4,23,59)+path('M28 23V45H49m-5-5 5 5-5 5M53 39l8 12M61 39l-8 12'))

def icon_svg(row):
    return f'<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" style="color:#334155" role="img" aria-label="{escape(row["label"])}"><title>{escape(row["label"])}</title><g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{row["svg"]}</g></svg>'

if __name__ == '__main__':
    OUT.mkdir(parents=True,exist_ok=True)
    for row in rows:
        (OUT / (row['id']+'.svg')).write_text(icon_svg(row),encoding='utf-8')
    data={row['id']:row for row in rows}
    (ROOT/'src/system-design.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    core_path=ROOT/'src/flow-core.js'
    core=core_path.read_text()
    start='/* SYSTEM_DESIGN_START */'; end='/* SYSTEM_DESIGN_END */'
    block=start+'\nconst SYSTEM_DESIGN='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';\n'+end
    if start in core:
        core=core[:core.index(start)]+block+core[core.index(end)+len(end):]
    else:
        core=core.replace("'use strict';", "'use strict';\n"+block,1)
    core_path.write_text(core,encoding='utf-8')
    manifest={'name':'Animated Flow Studio — System Design','version':1,'count':len(rows),'source':'75 numbered terms in the PDF supplied by the user; availability (38, 67) deduplicated.','artwork':'Original SVG geometry, created for this project. No raster embedding, extraction or tracing of the PDF illustrations.','components':[{**{k:v for k,v in r.items() if k!='svg'},'file':r['id']+'.svg','node':{'type':'system','icon':'sd:'+r['id'],'label':r['label'],'w':190,'h':62,'borderColor':'#000000'}} for r in rows]}
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'Built {len(rows)} original SVG symbols.')
