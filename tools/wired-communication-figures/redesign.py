"""Prepare the 38 Figma revisions without touching current website assets."""
import json
import argparse
import shutil
from pathlib import Path
from redesign_can import DRAWERS as CAN
from redesign_serial import DRAWERS as SERIAL

ROOT=Path(__file__).resolve().parents[2]
CACHE=ROOT/'.vitepress/cache/wired-redesign'
FILE_KEY='GMuPLPoa8dWTF9vdT6qsEs'
FRAMES={
 'can-arbitration-retransmission':'2:61','can-bit-stuffing':'2:141',
 'can-bus-connection':'2:204','can-connection-low-layer':'2:241','can-connection':'2:278',
 'can-controller-vs-transceiver':'2:331','can-differential-signal':'2:365',
 'can-error-state-flow':'2:396','can-fd-frame-detail':'2:436','can-message-broadcast':'2:485',
 'can-termination-reflection-check':'2:531','can-vs-canfd-frame':'2:557',
 'classical-can-frame':'2:583','differential-noise-immunity':'2:612',
 'i2c-clock-data-signal':'2:622','i2c-open-drain-pullup':'2:653',
 'i2c-pullup-resistor-tradeoff':'2:669','i2c-shared-bus':'2:680',
 'single-ended-vs-differential':'2:699','spi-chip-select-wiring':'2:715',
 'spi-daisy-chain-wiring':'2:750','uart_connection':'2:776','uart-connection':'2:792',
 'uart-frame-8n1':'2:808','uart-waveform':'2:834',
 'Mobile · can-arbitration-retransmission':'2:7','Mobile · can-bit-stuffing':'2:116',
 'Mobile · can-bus-connection':'2:168','Mobile · can-controller-vs-transceiver':'2:315',
 'Mobile · can-differential-signal':'2:354','Mobile · can-error-state-flow':'2:374',
 'Mobile · can-fd-frame-detail':'2:419','Mobile · can-message-broadcast':'2:454',
 'Mobile · can-termination-reflection-check':'2:516','Mobile · can-vs-canfd-frame':'2:546',
 'Mobile · classical-can-frame':'2:566','Mobile · differential-noise-immunity':'2:601',
 'Mobile · i2c-open-drain-pullup':'2:636',
}


def scenes():
    drawers={**CAN,**SERIAL}
    output=[]
    for name,node_id in FRAMES.items():
        mobile=name.startswith('Mobile · ')
        base=name.removeprefix('Mobile · ')
        scene=drawers[base](mobile)
        record=scene.data(name)
        record['nodeId']=node_id
        record['exportName']=base+('-mobile' if mobile else '')
        output.append((scene,record))
    return output


if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--site',action='store_true',help='Publish the reviewed SVGs to the article image directory')
    args=parser.parse_args()
    CACHE.mkdir(parents=True,exist_ok=True)
    entries=scenes()
    for scene,item in entries:
        (CACHE/(item['exportName']+'.svg')).write_text(scene.svg(True),encoding='utf-8')
    (CACHE/'scenes.json').write_text(json.dumps([item for _,item in entries],ensure_ascii=False),encoding='utf-8')
    assert len(entries)==38
    assert 0x120^0x130==1<<4
    assert all('nan' not in item['svg'].lower() and 'infinity' not in item['svg'].lower() for _,item in entries)
    if args.site:
        target=ROOT/'Docs/Technical_articles/Other_Articles/Wired_communication/images/Wired_Communication'
        for _,item in entries:
            name=item['exportName']+'.svg'
            shutil.copyfile(CACHE/name,target/name)
    print(f'Prepared {len(entries)} diagrams; published={args.site}.')
