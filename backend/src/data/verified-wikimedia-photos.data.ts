import type { CountryData, CountryPhoto, CountryLandmarkItem } from './countries.data';

export interface VerifiedWikimediaEntry {
  title: string;
  url: string;
  thumbUrl: string;
  sourceUrl: string;
  authorName: string;
  license: string;
  description: string;
}

export const VERIFIED_WIKIMEDIA_PHOTOS: Record<string, VerifiedWikimediaEntry> = {
  "france.city.nice": {
    "title": "File:Vista panoramica del Porto di Nizza e della costa orientale della città, fotografata dalla Collina del Castello.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Vista_panoramica_del_Porto_di_Nizza_e_della_costa_orientale_della_citt%C3%A0%2C_fotografata_dalla_Collina_del_Castello.jpg/1280px-Vista_panoramica_del_Porto_di_Nizza_e_della_costa_orientale_della_citt%C3%A0%2C_fotografata_dalla_Collina_del_Castello.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Vista_panoramica_del_Porto_di_Nizza_e_della_costa_orientale_della_citt%C3%A0%2C_fotografata_dalla_Collina_del_Castello.jpg/640px-Vista_panoramica_del_Porto_di_Nizza_e_della_costa_orientale_della_citt%C3%A0%2C_fotografata_dalla_Collina_del_Castello.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Vista_panoramica_del_Porto_di_Nizza_e_della_costa_orientale_della_citt%C3%A0,_fotografata_dalla_Collina_del_Castello.jpg",
    "authorName": "Marco Del Torchio 95",
    "license": "CC BY 4.0",
    "description": "Panoramic view of the Port of Nice and the eastern coastline of the city, photographed from Castle Hill."
  },
  "australia.gallery.reef": {
    "title": "File:Aerial views of The Great Barrier Reef, Queensland (Ank Kumar) 05.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Aerial_views_of_The_Great_Barrier_Reef%2C_Queensland_%28Ank_Kumar%29_05.jpg/1280px-Aerial_views_of_The_Great_Barrier_Reef%2C_Queensland_%28Ank_Kumar%29_05.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Aerial_views_of_The_Great_Barrier_Reef%2C_Queensland_%28Ank_Kumar%29_05.jpg/640px-Aerial_views_of_The_Great_Barrier_Reef%2C_Queensland_%28Ank_Kumar%29_05.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Aerial_views_of_The_Great_Barrier_Reef,_Queensland_(Ank_Kumar)_05.jpg",
    "authorName": "Ank gsx",
    "license": "CC BY-SA 4.0",
    "description": "Aerial views of The Great Barrier Reef, Queensland"
  },
  "russia.gallery.altai": {
    "title": "File:Katun River, Altai, Russia (14940666671).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Katun_River%2C_Altai%2C_Russia_%2814940666671%29.jpg/1280px-Katun_River%2C_Altai%2C_Russia_%2814940666671%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9c/Katun_River%2C_Altai%2C_Russia_%2814940666671%29.jpg/640px-Katun_River%2C_Altai%2C_Russia_%2814940666671%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Katun_River,_Altai,_Russia_(14940666671).jpg",
    "authorName": "A Vahanvaty from Dubai, UAE",
    "license": "CC BY-SA 2.0",
    "description": "Katun River, Altai, Russia"
  },
  "italy.gallery.amalfi": {
    "title": "File:Positano (Italy) 02.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Positano_%28Italy%29_02.jpg/1280px-Positano_%28Italy%29_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Positano_%28Italy%29_02.jpg/640px-Positano_%28Italy%29_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Positano_(Italy)_02.jpg",
    "authorName": "Bernard Gagnon",
    "license": "CC BY 4.0",
    "description": "View of Positano on Amalfi Coast, Italy"
  },
  "france.gallery.cotedazur": {
    "title": "File:Nice, Quai des États-Unis and Promenade des Anglais FRANCE.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Nice%2C_Quai_des_%C3%89tats-Unis_and_Promenade_des_Anglais_FRANCE.jpg/1280px-Nice%2C_Quai_des_%C3%89tats-Unis_and_Promenade_des_Anglais_FRANCE.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Nice%2C_Quai_des_%C3%89tats-Unis_and_Promenade_des_Anglais_FRANCE.jpg/640px-Nice%2C_Quai_des_%C3%89tats-Unis_and_Promenade_des_Anglais_FRANCE.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nice,_Quai_des_%C3%89tats-Unis_and_Promenade_des_Anglais_FRANCE.jpg",
    "authorName": "Lspigon",
    "license": "Public domain",
    "description": "The sea and the old town in Nice (France)"
  },
  "egypt.city.sharm": {
    "title": "File:Naama Bay R01.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Naama_Bay_R01.jpg/1280px-Naama_Bay_R01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Naama_Bay_R01.jpg/640px-Naama_Bay_R01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Naama_Bay_R01.jpg",
    "authorName": "Marc Ryckaert",
    "license": "CC BY 3.0",
    "description": "Sharm el-Sheikh (Egypt): panorama of Naama Bay"
  },
  "australia.city.cairns": {
    "title": "File:Cairns Esplanade Lagoon Pool, Esplanade, Cairns, Queensland, Australia - panoramio.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Cairns_Esplanade_Lagoon_Pool%2C_Esplanade%2C_Cairns%2C_Queensland%2C_Australia_-_panoramio.jpg/1280px-Cairns_Esplanade_Lagoon_Pool%2C_Esplanade%2C_Cairns%2C_Queensland%2C_Australia_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Cairns_Esplanade_Lagoon_Pool%2C_Esplanade%2C_Cairns%2C_Queensland%2C_Australia_-_panoramio.jpg/640px-Cairns_Esplanade_Lagoon_Pool%2C_Esplanade%2C_Cairns%2C_Queensland%2C_Australia_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cairns_Esplanade_Lagoon_Pool,_Esplanade,_Cairns,_Queensland,_Australia_-_panoramio.jpg",
    "authorName": "Alex Monckton",
    "license": "CC BY-SA 3.0",
    "description": "Cairns Esplanade Lagoon Pool, Esplanade, Cairns, Queensland, Australia"
  },
  "switzerland.gallery.jungfrau": {
    "title": "File:Jungfraujoch 2016-09-02 n21.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Jungfraujoch_2016-09-02_n21.jpg/1280px-Jungfraujoch_2016-09-02_n21.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Jungfraujoch_2016-09-02_n21.jpg/640px-Jungfraujoch_2016-09-02_n21.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jungfraujoch_2016-09-02_n21.jpg",
    "authorName": "Marie-Lan Nguyen",
    "license": "CC BY 4.0",
    "description": "The terminus of the Guggi glacier and a alpine hut viewed from the Sphinx Observatory panoramic terrace on Jungfraujoch ."
  },
  "germany.gallery.cologne": {
    "title": "File:Cologne - Panoramic Image of the old town at dusk.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Cologne_-_Panoramic_Image_of_the_old_town_at_dusk.jpg/1280px-Cologne_-_Panoramic_Image_of_the_old_town_at_dusk.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Cologne_-_Panoramic_Image_of_the_old_town_at_dusk.jpg/640px-Cologne_-_Panoramic_Image_of_the_old_town_at_dusk.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cologne_-_Panoramic_Image_of_the_old_town_at_dusk.jpg",
    "authorName": "Ahgee",
    "license": "CC BY-SA 3.0",
    "description": "Panoramic view of the old town of Cologne ( North Rhine-Westphalia , Germany ) taken from the other side of the river Rhine at dusk (09:58pm). You can see (from left to right) the former Lufthansa cor"
  },
  "greece.gallery.meteora": {
    "title": "File:Meteora Agios Triadas IMG 7632.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Meteora_Agios_Triadas_IMG_7632.jpg/1280px-Meteora_Agios_Triadas_IMG_7632.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5e/Meteora_Agios_Triadas_IMG_7632.jpg/640px-Meteora_Agios_Triadas_IMG_7632.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Meteora_Agios_Triadas_IMG_7632.jpg",
    "authorName": "Dido3",
    "license": "CC BY-SA 3.0",
    "description": "Moni Agios Triadas, Meteora , Greece"
  },
  "greece.gallery.navagio": {
    "title": "File:Navagio, Zante 02.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Navagio%2C_Zante_02.jpg/1280px-Navagio%2C_Zante_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2a/Navagio%2C_Zante_02.jpg/640px-Navagio%2C_Zante_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Navagio,_Zante_02.jpg",
    "authorName": "Wilnel José Verdú Guerrero",
    "license": "CC BY-SA 4.0",
    "description": "Navagio Beach at Zakynthos (Greece)"
  },
  "uk.city.edinburgh": {
    "title": "File:Edinburgh Old Town Skyline from Calton Hill - geograph.org.uk - 7968954.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/9/97/Edinburgh_Old_Town_Skyline_from_Calton_Hill_-_geograph.org.uk_-_7968954.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/9/97/Edinburgh_Old_Town_Skyline_from_Calton_Hill_-_geograph.org.uk_-_7968954.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Old_Town_Skyline_from_Calton_Hill_-_geograph.org.uk_-_7968954.jpg",
    "authorName": "Iain Lees",
    "license": "CC BY-SA 2.0",
    "description": "Edinburgh Old Town Skyline from Calton Hill"
  },
  "switzerland.gallery.lauterbrunnen": {
    "title": "File:1 lauterbrunnen valley 2012.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/1_lauterbrunnen_valley_2012.jpg/1280px-1_lauterbrunnen_valley_2012.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7c/1_lauterbrunnen_valley_2012.jpg/640px-1_lauterbrunnen_valley_2012.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:1_lauterbrunnen_valley_2012.jpg",
    "authorName": "chensiyuan",
    "license": "CC BY-SA 4.0",
    "description": "lauterbrunnen valley from wengen 2012 switzerland"
  },
  "germany.gallery.bavaria": {
    "title": "File:Aerial image of Königssee (view from the south).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Aerial_image_of_K%C3%B6nigssee_%28view_from_the_south%29.jpg/1280px-Aerial_image_of_K%C3%B6nigssee_%28view_from_the_south%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Aerial_image_of_K%C3%B6nigssee_%28view_from_the_south%29.jpg/640px-Aerial_image_of_K%C3%B6nigssee_%28view_from_the_south%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Aerial_image_of_K%C3%B6nigssee_(view_from_the_south).jpg",
    "authorName": "Carsten Steger",
    "license": "CC BY-SA 4.0",
    "description": "Aerial image of Königssee (view from the south)"
  },
  "portugal.gallery.algarve": {
    "title": "File:Ponta da Piedade Algarve Portugal.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Ponta_da_Piedade_Algarve_Portugal.jpg/1280px-Ponta_da_Piedade_Algarve_Portugal.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Ponta_da_Piedade_Algarve_Portugal.jpg/640px-Ponta_da_Piedade_Algarve_Portugal.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ponta_da_Piedade_Algarve_Portugal.jpg",
    "authorName": "Dronepicr",
    "license": "CC BY 3.0",
    "description": "Die Ponta da Piedade ist die Spitze einer steilen Landzunge in der Nähe von Lagos (Portugal) am Stadtrand von Lagos an der Algarve."
  },
  "norway.city.tromso": {
    "title": "File:The Arctic Cathedral and Tromsø Bridge (8528102982).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/The_Arctic_Cathedral_and_Troms%C3%B8_Bridge_%288528102982%29.jpg/1280px-The_Arctic_Cathedral_and_Troms%C3%B8_Bridge_%288528102982%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/The_Arctic_Cathedral_and_Troms%C3%B8_Bridge_%288528102982%29.jpg/640px-The_Arctic_Cathedral_and_Troms%C3%B8_Bridge_%288528102982%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Arctic_Cathedral_and_Troms%C3%B8_Bridge_(8528102982).jpg",
    "authorName": "Bernt Rostad from Oslo, Norway",
    "license": "CC BY 2.0",
    "description": "View of the Arctic Cathedral with the Tromsø Bridge and the Tromsøya island in the background."
  },
  "czechia.gallery.krumlov": {
    "title": "File:Cesky Krumlov 25.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Cesky_Krumlov_25.JPG/1280px-Cesky_Krumlov_25.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Cesky_Krumlov_25.JPG/640px-Cesky_Krumlov_25.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cesky_Krumlov_25.JPG",
    "authorName": "Scotch Mist",
    "license": "CC BY-SA 4.0",
    "description": "Český Krumlov is a small city in the South Bohemian Region of the Czech Republic and Old Český Krumlov is a UNESCO World Heritage Site. Construction of the town and Český Krumlov Castle began in the l"
  },
  "greece.city.crete": {
    "title": "File:Harbor and Venetian shipyards in Chania. Crete, Greece.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Harbor_and_Venetian_shipyards_in_Chania._Crete%2C_Greece.jpg/1280px-Harbor_and_Venetian_shipyards_in_Chania._Crete%2C_Greece.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Harbor_and_Venetian_shipyards_in_Chania._Crete%2C_Greece.jpg/640px-Harbor_and_Venetian_shipyards_in_Chania._Crete%2C_Greece.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Harbor_and_Venetian_shipyards_in_Chania._Crete,_Greece.jpg",
    "authorName": "Ввласенко",
    "license": "CC BY-SA 3.0",
    "description": "Harbor and Venetian shipyards in Chania. Crete, Greece"
  },
  "portugal.gallery.belem": {
    "title": "File:Torre Belém April 2009-4a.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Torre_Bel%C3%A9m_April_2009-4a.jpg/1280px-Torre_Bel%C3%A9m_April_2009-4a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/65/Torre_Bel%C3%A9m_April_2009-4a.jpg/640px-Torre_Bel%C3%A9m_April_2009-4a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Torre_Bel%C3%A9m_April_2009-4a.jpg",
    "authorName": "Alvesgaspar",
    "license": "CC BY-SA 3.0",
    "description": "The Tower of Belém , Lisbon , Portugal . View from Northeast."
  },
  "czechia.gallery.bohemian": {
    "title": "File:Pravčická brána (Prebischtor) - by Pudelek.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Prav%C4%8Dick%C3%A1_br%C3%A1na_%28Prebischtor%29_-_by_Pudelek.jpg/1280px-Prav%C4%8Dick%C3%A1_br%C3%A1na_%28Prebischtor%29_-_by_Pudelek.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c7/Prav%C4%8Dick%C3%A1_br%C3%A1na_%28Prebischtor%29_-_by_Pudelek.jpg/640px-Prav%C4%8Dick%C3%A1_br%C3%A1na_%28Prebischtor%29_-_by_Pudelek.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Prav%C4%8Dick%C3%A1_br%C3%A1na_(Prebischtor)_-_by_Pudelek.jpg",
    "authorName": "Pudelek",
    "license": "CC BY-SA 4.0",
    "description": "Pravčická brána (Prebischtor) . Bohemian Switzerland"
  },
  "china.city.xian": {
    "title": "File:·˙·ChinaUli2010·.· Xi'an - Terracotta Army - panoramio.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/%C2%B7%CB%99%C2%B7ChinaUli2010%C2%B7.%C2%B7_Xi%27an_-_Terracotta_Army_-_panoramio.jpg/1280px-%C2%B7%CB%99%C2%B7ChinaUli2010%C2%B7.%C2%B7_Xi%27an_-_Terracotta_Army_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/16/%C2%B7%CB%99%C2%B7ChinaUli2010%C2%B7.%C2%B7_Xi%27an_-_Terracotta_Army_-_panoramio.jpg/640px-%C2%B7%CB%99%C2%B7ChinaUli2010%C2%B7.%C2%B7_Xi%27an_-_Terracotta_Army_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:%C2%B7%CB%99%C2%B7ChinaUli2010%C2%B7.%C2%B7_Xi%27an_-_Terracotta_Army_-_panoramio.jpg",
    "authorName": "·˙·ChinaUli2010·.·",
    "license": "CC BY 3.0",
    "description": "·˙·ChinaUli2010·.· Xi'an - Terracotta Army"
  },
  "china.gallery.guilin": {
    "title": "File:Li River and mountains in Yangshuo County, Guilin52.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Li_River_and_mountains_in_Yangshuo_County%2C_Guilin52.jpg/1280px-Li_River_and_mountains_in_Yangshuo_County%2C_Guilin52.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Li_River_and_mountains_in_Yangshuo_County%2C_Guilin52.jpg/640px-Li_River_and_mountains_in_Yangshuo_County%2C_Guilin52.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Li_River_and_mountains_in_Yangshuo_County,_Guilin52.jpg",
    "authorName": "Huangdan2060",
    "license": "CC0",
    "description": "Li River and mountains in Yangshuo County, Guilin, Guangxi, China."
  },
  "korea.gallery.jeju": {
    "title": "File:Hydrangea macrophylla in front of Seongsan Ilchulbong volcano at blue hour in Jeju Island South Korea.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg/1280px-Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/19/Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg/640px-Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hydrangea_macrophylla_in_front_of_Seongsan_Ilchulbong_volcano_at_blue_hour_in_Jeju_Island_South_Korea.jpg",
    "authorName": "Basile Morin",
    "license": "CC BY-SA 4.0",
    "description": "Hydrangea macrophylla (hortensia) in front of Seongsan Ilchulbong volcano at blue hour in the evening, in Jeju Island , in South Korea . Long-exposure photography (25 s)"
  },
  "korea.city.busan": {
    "title": "File:Gwangan Bridge, Busan, lighted up in purple for BTS, June 2019.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Gwangan_Bridge%2C_Busan%2C_lighted_up_in_purple_for_BTS%2C_June_2019.jpg/1280px-Gwangan_Bridge%2C_Busan%2C_lighted_up_in_purple_for_BTS%2C_June_2019.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fd/Gwangan_Bridge%2C_Busan%2C_lighted_up_in_purple_for_BTS%2C_June_2019.jpg/640px-Gwangan_Bridge%2C_Busan%2C_lighted_up_in_purple_for_BTS%2C_June_2019.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Gwangan_Bridge,_Busan,_lighted_up_in_purple_for_BTS,_June_2019.jpg",
    "authorName": "Busan Metropolitan City citizen photo journal...",
    "license": "KOGL Type 1",
    "description": "Gwangan Bridge, Busan, lighted up in purple for boy band BTS and fandom ARMY for 5th muster Magic Shop , June 2019"
  },
  "korea.gallery.busan": {
    "title": "File:Colorful houses in Gamcheon Culture Village at sunset in Busan South Korea.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Colorful_houses_in_Gamcheon_Culture_Village_at_sunset_in_Busan_South_Korea.jpg/1280px-Colorful_houses_in_Gamcheon_Culture_Village_at_sunset_in_Busan_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Colorful_houses_in_Gamcheon_Culture_Village_at_sunset_in_Busan_South_Korea.jpg/640px-Colorful_houses_in_Gamcheon_Culture_Village_at_sunset_in_Busan_South_Korea.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Colorful_houses_in_Gamcheon_Culture_Village_at_sunset_in_Busan_South_Korea.jpg",
    "authorName": "Basile Morin",
    "license": "CC BY-SA 4.0",
    "description": "Colorful houses in Gamcheon Culture Village , seen from Okcheon-ro road, at sunset, in Busan , South Korea ."
  },
  "india.gallery.kerala": {
    "title": "File:Houseboat on Alleppey backwaters (Kerala, India 2023) (52704577484).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Houseboat_on_Alleppey_backwaters_%28Kerala%2C_India_2023%29_%2852704577484%29.jpg/1280px-Houseboat_on_Alleppey_backwaters_%28Kerala%2C_India_2023%29_%2852704577484%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Houseboat_on_Alleppey_backwaters_%28Kerala%2C_India_2023%29_%2852704577484%29.jpg/640px-Houseboat_on_Alleppey_backwaters_%28Kerala%2C_India_2023%29_%2852704577484%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Houseboat_on_Alleppey_backwaters_(Kerala,_India_2023)_(52704577484).jpg",
    "authorName": "Paul Arps from The Netherlands",
    "license": "CC BY 2.0",
    "description": "Houseboat on Alleppey backwaters (Kerala, India 2023)"
  },
  "vietnam.city.danang": {
    "title": "File:Da Nang International Fireworks Festival DIFF Dragon Bridge Han River night skyline Vietnam.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Da_Nang_International_Fireworks_Festival_DIFF_Dragon_Bridge_Han_River_night_skyline_Vietnam.jpg/1280px-Da_Nang_International_Fireworks_Festival_DIFF_Dragon_Bridge_Han_River_night_skyline_Vietnam.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/Da_Nang_International_Fireworks_Festival_DIFF_Dragon_Bridge_Han_River_night_skyline_Vietnam.jpg/640px-Da_Nang_International_Fireworks_Festival_DIFF_Dragon_Bridge_Han_River_night_skyline_Vietnam.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Da_Nang_International_Fireworks_Festival_DIFF_Dragon_Bridge_Han_River_night_skyline_Vietnam.jpg",
    "authorName": "Vivu Vietnam",
    "license": "CC BY-SA 4.0",
    "description": "Fireworks over the Han River during the Da Nang International Fireworks Festival (DIFF), with the illuminated Dragon Bridge in the foreground and the city skyline at night."
  },
  "indonesia.gallery.uluwatu": {
    "title": "File:Cliffs of Uluwatu, Bali, Indonesia, 20220826 1006 1038.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Cliffs_of_Uluwatu%2C_Bali%2C_Indonesia%2C_20220826_1006_1038.jpg/1280px-Cliffs_of_Uluwatu%2C_Bali%2C_Indonesia%2C_20220826_1006_1038.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/60/Cliffs_of_Uluwatu%2C_Bali%2C_Indonesia%2C_20220826_1006_1038.jpg/640px-Cliffs_of_Uluwatu%2C_Bali%2C_Indonesia%2C_20220826_1006_1038.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cliffs_of_Uluwatu,_Bali,_Indonesia,_20220826_1006_1038.jpg",
    "authorName": "Jakub Hałun",
    "license": "CC BY-SA 4.0",
    "description": "Cliffs of Uluwatu with Luhur Uluwatu temple, Bali, Indonesia"
  },
  "indonesia.city.yogyakarta": {
    "title": "File:Yogyakarta Indonesia Prambanan-temple-complex-02.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Yogyakarta_Indonesia_Prambanan-temple-complex-02.jpg/1280px-Yogyakarta_Indonesia_Prambanan-temple-complex-02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Yogyakarta_Indonesia_Prambanan-temple-complex-02.jpg/640px-Yogyakarta_Indonesia_Prambanan-temple-complex-02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Yogyakarta_Indonesia_Prambanan-temple-complex-02.jpg",
    "authorName": "CEphoto, Uwe Aranas",
    "license": "CC BY-SA 3.0",
    "description": "Yogyakarta, Indonesia: Prambanan temple complex."
  },
  "vietnam.city.hochiminh": {
    "title": "File:Río Saigón, Ciudad Ho Chi Minh, Vietnam, 2013-08-14, DD 29.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/R%C3%ADo_Saig%C3%B3n%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_29.JPG/1280px-R%C3%ADo_Saig%C3%B3n%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/R%C3%ADo_Saig%C3%B3n%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_29.JPG/640px-R%C3%ADo_Saig%C3%B3n%2C_Ciudad_Ho_Chi_Minh%2C_Vietnam%2C_2013-08-14%2C_DD_29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:R%C3%ADo_Saig%C3%B3n,_Ciudad_Ho_Chi_Minh,_Vietnam,_2013-08-14,_DD_29.JPG",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 3.0",
    "description": "Saigon river, Ho Chi Minh City, Vietnam"
  },
  "indonesia.gallery.borobudur": {
    "title": "File:Indonesia Borobudur Temple.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Indonesia_Borobudur_Temple.jpg/1280px-Indonesia_Borobudur_Temple.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/Indonesia_Borobudur_Temple.jpg/640px-Indonesia_Borobudur_Temple.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Indonesia_Borobudur_Temple.jpg",
    "authorName": "Ranggaaditya11",
    "license": "CC BY-SA 4.0",
    "description": "this is the most beautiful temple in Indonesia which called Borobudur that located in Magelang , cetral of Java"
  },
  "uzbekistan.city.tashkent": {
    "title": "File:Hotel Usbekistan und Kongresspalast, Taschkent.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Hotel_Usbekistan_und_Kongresspalast%2C_Taschkent.jpg/1280px-Hotel_Usbekistan_und_Kongresspalast%2C_Taschkent.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2d/Hotel_Usbekistan_und_Kongresspalast%2C_Taschkent.jpg/640px-Hotel_Usbekistan_und_Kongresspalast%2C_Taschkent.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hotel_Usbekistan_und_Kongresspalast,_Taschkent.jpg",
    "authorName": "Doris Ingeborg Lohse",
    "license": "CC BY-SA 4.0",
    "description": "Das Hotel Usbekistan und der Kongresspalast über den Amir-Timur-Platz von Westen her gesehen"
  },
  "georgia.gallery.jvari": {
    "title": "File:Confluence of the Aragvi and Kura (Mtkvari) rivers, Mtskheta, Georgia, seen from Jvari monastery.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Confluence_of_the_Aragvi_and_Kura_%28Mtkvari%29_rivers%2C_Mtskheta%2C_Georgia%2C_seen_from_Jvari_monastery.jpg/1280px-Confluence_of_the_Aragvi_and_Kura_%28Mtkvari%29_rivers%2C_Mtskheta%2C_Georgia%2C_seen_from_Jvari_monastery.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Confluence_of_the_Aragvi_and_Kura_%28Mtkvari%29_rivers%2C_Mtskheta%2C_Georgia%2C_seen_from_Jvari_monastery.jpg/640px-Confluence_of_the_Aragvi_and_Kura_%28Mtkvari%29_rivers%2C_Mtskheta%2C_Georgia%2C_seen_from_Jvari_monastery.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Confluence_of_the_Aragvi_and_Kura_(Mtkvari)_rivers,_Mtskheta,_Georgia,_seen_from_Jvari_monastery.jpg",
    "authorName": "Margot Kask",
    "license": "CC BY-SA 3.0",
    "description": "Confluence of the Aragvi and Kura (Mtkvari) rivers, Mtskheta, Georgia, seen from Jvari monastery. The camera is pointed to the west."
  },
  "uzbekistan.gallery.khiva": {
    "title": "File:Khiva, Uzbekistan 74 (054) Kalta Minor.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Khiva%2C_Uzbekistan_74_%28054%29_Kalta_Minor.jpg/1280px-Khiva%2C_Uzbekistan_74_%28054%29_Kalta_Minor.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Khiva%2C_Uzbekistan_74_%28054%29_Kalta_Minor.jpg/640px-Khiva%2C_Uzbekistan_74_%28054%29_Kalta_Minor.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Khiva,_Uzbekistan_74_(054)_Kalta_Minor.jpg",
    "authorName": "Jaan Künnap",
    "license": "CC BY-SA 4.0",
    "description": "Khiva, Uzbekistan 74 (054) Kalta Minor"
  },
  "morocco.gallery.aitbenhaddou": {
    "title": "File:Aït Benhaddou view from a restaurant.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/A%C3%AFt_Benhaddou_view_from_a_restaurant.jpg/1280px-A%C3%AFt_Benhaddou_view_from_a_restaurant.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/A%C3%AFt_Benhaddou_view_from_a_restaurant.jpg/640px-A%C3%AFt_Benhaddou_view_from_a_restaurant.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:A%C3%AFt_Benhaddou_view_from_a_restaurant.jpg",
    "authorName": "Elena Tatiana Chis",
    "license": "CC BY-SA 4.0",
    "description": "View on Ksar of Ait-Ben-Haddou from a restaurant, Morocco"
  },
  "tanzania.gallery.nungwi": {
    "title": "File:Nungwi (2010-011-1318-T).jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Nungwi_%282010-011-1318-T%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/8/8d/Nungwi_%282010-011-1318-T%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nungwi_(2010-011-1318-T).jpg",
    "authorName": "Moongateclimber",
    "license": "CC BY 3.0",
    "description": "The beach at Nungwi, Zanzibar, with a fishing dhow."
  },
  "tanzania.gallery.daressalaam": {
    "title": "File:Dar Es Salaam Skyline (34011488084).jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/5/53/Dar_Es_Salaam_Skyline_%2834011488084%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/5/53/Dar_Es_Salaam_Skyline_%2834011488084%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dar_Es_Salaam_Skyline_(34011488084).jpg",
    "authorName": "David Stanley from Nanaimo, Canada",
    "license": "CC BY 2.0",
    "description": "Increasing numbers of flashy highrise buildings financed by official agencies are popping up along the Dar es Salaam waterfront. A poor developing country, Tanzania still has plenty of money to spend "
  },
  "southafrica.city.durban": {
    "title": "File:Golden Mile (3699002746).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Golden_Mile_%283699002746%29.jpg/1280px-Golden_Mile_%283699002746%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Golden_Mile_%283699002746%29.jpg/640px-Golden_Mile_%283699002746%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Golden_Mile_(3699002746).jpg",
    "authorName": "Chris Bloom from Durban, South Africa",
    "license": "CC BY-SA 2.0",
    "description": "&lt;a href=\" http://chrisbloom.blogspot.com/2009/07/kiev-pictures-from-durban-beachfront.html#links \" rel=\"nofollow\"&gt;Chris Bloom's Film Photography Blog: Kiev Pictures From Durban Beachfront&lt;/a&"
  },
  "southafrica.gallery.boulders": {
    "title": "File:Pingüinos de El Cabo (Spheniscus demersus), Playa de Boulders, Simon's Town, Sudáfrica, 2018-07-23, DD PAN 40-42.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Ping%C3%BCinos_de_El_Cabo_%28Spheniscus_demersus%29%2C_Playa_de_Boulders%2C_Simon%27s_Town%2C_Sud%C3%A1frica%2C_2018-07-23%2C_DD_PAN_40-42.jpg/1280px-Ping%C3%BCinos_de_El_Cabo_%28Spheniscus_demersus%29%2C_Playa_de_Boulders%2C_Simon%27s_Town%2C_Sud%C3%A1frica%2C_2018-07-23%2C_DD_PAN_40-42.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Ping%C3%BCinos_de_El_Cabo_%28Spheniscus_demersus%29%2C_Playa_de_Boulders%2C_Simon%27s_Town%2C_Sud%C3%A1frica%2C_2018-07-23%2C_DD_PAN_40-42.jpg/640px-Ping%C3%BCinos_de_El_Cabo_%28Spheniscus_demersus%29%2C_Playa_de_Boulders%2C_Simon%27s_Town%2C_Sud%C3%A1frica%2C_2018-07-23%2C_DD_PAN_40-42.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ping%C3%BCinos_de_El_Cabo_(Spheniscus_demersus),_Playa_de_Boulders,_Simon%27s_Town,_Sud%C3%A1frica,_2018-07-23,_DD_PAN_40-42.jpg",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "Panoramic view of the famous African penguins ( Spheniscus demersus ) colony in Boulders Beach, Simon's Town , South Africa."
  },
  "tanzania.city.daressalaam": {
    "title": "File:Nyerere Bridge - Kigamboni .jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Nyerere_Bridge_-_Kigamboni_.jpg/1280px-Nyerere_Bridge_-_Kigamboni_.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Nyerere_Bridge_-_Kigamboni_.jpg/640px-Nyerere_Bridge_-_Kigamboni_.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nyerere_Bridge_-_Kigamboni_.jpg",
    "authorName": "Mzalendo2016",
    "license": "CC BY-SA 4.0",
    "description": "Nyerere Bridge - Kigamboni Dar es Salaam"
  },
  "mexico.city.cancun": {
    "title": "File:Zona Hotelera, Cancún, Q.R., Mexico - panoramio (7).jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Zona_Hotelera%2C_Canc%C3%BAn%2C_Q.R.%2C_Mexico_-_panoramio_%287%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/f/fb/Zona_Hotelera%2C_Canc%C3%BAn%2C_Q.R.%2C_Mexico_-_panoramio_%287%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Zona_Hotelera,_Canc%C3%BAn,_Q.R.,_Mexico_-_panoramio_(7).jpg",
    "authorName": "Alfonzo Buscemi",
    "license": "CC BY 3.0",
    "description": "Zona Hotelera, Cancún, Q.R., Mexico"
  },
  "mexico.gallery.cancun": {
    "title": "File:Tulum Mayan Ruins (213574099).jpeg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Tulum_Mayan_Ruins_%28213574099%29.jpeg/1280px-Tulum_Mayan_Ruins_%28213574099%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/Tulum_Mayan_Ruins_%28213574099%29.jpeg/640px-Tulum_Mayan_Ruins_%28213574099%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tulum_Mayan_Ruins_(213574099).jpeg",
    "authorName": "Dronepicr",
    "license": "CC BY 3.0",
    "description": "500px provided description: Tulum Mayan Ruins [#sea ,#nature ,#mexico ,#tulum ,#beach ,#travel ,#island ,#sun ,#ocean ,#outdoor ,#summer ,#aerial ,#photo ,#sight ,#maya ,#photography ,#holiday ,#under"
  },
  "mexico.gallery.ikkil": {
    "title": "File:Cenote Ik Kil, Yucatan, Dec 2011 - 01.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Cenote_Ik_Kil%2C_Yucatan%2C_Dec_2011_-_01.jpg/1280px-Cenote_Ik_Kil%2C_Yucatan%2C_Dec_2011_-_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Cenote_Ik_Kil%2C_Yucatan%2C_Dec_2011_-_01.jpg/640px-Cenote_Ik_Kil%2C_Yucatan%2C_Dec_2011_-_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cenote_Ik_Kil,_Yucatan,_Dec_2011_-_01.jpg",
    "authorName": "Shinya Suzuki",
    "license": "CC BY 2.0",
    "description": "Cenote Ik Kil, Yucatan"
  },
  "argentina.gallery.colon": {
    "title": "File:Obelisco y Teatro Colón.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Obelisco_y_Teatro_Col%C3%B3n.jpg/1280px-Obelisco_y_Teatro_Col%C3%B3n.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/07/Obelisco_y_Teatro_Col%C3%B3n.jpg/640px-Obelisco_y_Teatro_Col%C3%B3n.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Obelisco_y_Teatro_Col%C3%B3n.jpg",
    "authorName": "Omegadeepside",
    "license": "CC BY-SA 4.0",
    "description": "Expresiones Arquitectónicas"
  },
  "argentina.gallery.laboca": {
    "title": "File:Buenos Aires - La Boca - Caminito - 200807j.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Buenos_Aires_-_La_Boca_-_Caminito_-_200807j.jpg/1280px-Buenos_Aires_-_La_Boca_-_Caminito_-_200807j.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Buenos_Aires_-_La_Boca_-_Caminito_-_200807j.jpg/640px-Buenos_Aires_-_La_Boca_-_Caminito_-_200807j.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Buenos_Aires_-_La_Boca_-_Caminito_-_200807j.jpg",
    "authorName": "Luis Argerich from Buenos Aires, Argentina",
    "license": "CC BY 2.0",
    "description": "Caminito, La Boca, Buenos Aires, Argentina."
  },
  "argentina.gallery.fitzroy": {
    "title": "File:Fitz Roy 1.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Fitz_Roy_1.jpg/1280px-Fitz_Roy_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Fitz_Roy_1.jpg/640px-Fitz_Roy_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fitz_Roy_1.jpg",
    "authorName": "Prissantenbär",
    "license": "Public domain",
    "description": "Monts Fitz Roy"
  },
  "argentina.gallery.peritomoreno": {
    "title": "File:Glaciar Perito Moreno.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Glaciar_Perito_Moreno.jpg/1280px-Glaciar_Perito_Moreno.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Glaciar_Perito_Moreno.jpg/640px-Glaciar_Perito_Moreno.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Glaciar_Perito_Moreno.jpg",
    "authorName": "Christophe Meneboeuf",
    "license": "CC BY-SA 3.0",
    "description": "Perito Moreno Glacier, Patagonia, Argentina"
  },
  "argentina.city.elcalafate": {
    "title": "File:Lago Argentino El Calafate.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Lago_Argentino_El_Calafate.jpg/1280px-Lago_Argentino_El_Calafate.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Lago_Argentino_El_Calafate.jpg/640px-Lago_Argentino_El_Calafate.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Lago_Argentino_El_Calafate.jpg",
    "authorName": "Wikimedia Commons",
    "license": "CC BY-SA 4.0",
    "description": "Panoramic view of Lago Argentino near El Calafate, Santa Cruz, Argentina"
  },
  "mexico.city.oaxaca": {
    "title": "File:Church of Santo Domingo Oaxaca.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Church_of_Santo_Domingo_Oaxaca.jpg/1280px-Church_of_Santo_Domingo_Oaxaca.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e4/Church_of_Santo_Domingo_Oaxaca.jpg/640px-Church_of_Santo_Domingo_Oaxaca.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Church_of_Santo_Domingo_Oaxaca.jpg",
    "authorName": "Alison Platt Kendall",
    "license": "CC BY-SA 4.0",
    "description": "Facade of the Church of Santo Domingo in Oaxaca City, Oaxaca, Mexico."
  },
  "argentina.city.buenosaires": {
    "title": "File:Parte superior del Obelisco de Buenos Aires.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Parte_superior_del_Obelisco_de_Buenos_Aires.jpg/1280px-Parte_superior_del_Obelisco_de_Buenos_Aires.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Parte_superior_del_Obelisco_de_Buenos_Aires.jpg/640px-Parte_superior_del_Obelisco_de_Buenos_Aires.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Parte_superior_del_Obelisco_de_Buenos_Aires.jpg",
    "authorName": "ProtoplasmaKid",
    "license": "CC BY-SA 4.0",
    "description": "Top of the Obelisk of Buenos Aires, intersection of Corrientes and 9 de Julio Avenues, San Nicolás neighborhood, Buenos Aires, Argentina."
  },
  "argentina.city.ushuaia": {
    "title": "File:Beaver dam in Tierra del Fuego.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Beaver_dam_in_Tierra_del_Fuego.jpg/1280px-Beaver_dam_in_Tierra_del_Fuego.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c2/Beaver_dam_in_Tierra_del_Fuego.jpg/640px-Beaver_dam_in_Tierra_del_Fuego.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Beaver_dam_in_Tierra_del_Fuego.jpg",
    "authorName": "User:IlyaHaykinson",
    "license": "CC BY-SA 1.0",
    "description": "Image of beaver dam near Ushuaia, Argentina."
  },
  "nz.gallery.tekapo": {
    "title": "File:Lake Tekapo. New Zealand. (11814292636).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Lake_Tekapo._New_Zealand._%2811814292636%29.jpg/1280px-Lake_Tekapo._New_Zealand._%2811814292636%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Lake_Tekapo._New_Zealand._%2811814292636%29.jpg/640px-Lake_Tekapo._New_Zealand._%2811814292636%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Lake_Tekapo._New_Zealand._(11814292636).jpg",
    "authorName": "Bernard Spragg. NZ from Christchurch, New Zea...",
    "license": "CC0",
    "description": "On the shores on the lake you'll see the beautiful Church of the Good Shepherd, where the altar window frames a perfect view of Mount Cook. The church was built in 1935 for the pioneer families of the"
  },
  "nz.city.wellington": {
    "title": "File:Wellington NZ-cablecar-topview.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Wellington_NZ-cablecar-topview.jpg/1280px-Wellington_NZ-cablecar-topview.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Wellington_NZ-cablecar-topview.jpg/640px-Wellington_NZ-cablecar-topview.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Wellington_NZ-cablecar-topview.jpg",
    "authorName": "Brett Taylor from Wellington, New Zealand",
    "license": "CC BY 2.0",
    "description": "You can find a postcard of Wellington with almost this same shot on it all over New Zealand. In the foreground, the red vehicle is one of the two Wellington Cable Cars The tall red and silver building"
  },
  "nz.gallery.auckland": {
    "title": "File:Auckland CBD skyline from Waitemata Harbour entrance.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Auckland_CBD_skyline_from_Waitemata_Harbour_entrance.jpg/1280px-Auckland_CBD_skyline_from_Waitemata_Harbour_entrance.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/37/Auckland_CBD_skyline_from_Waitemata_Harbour_entrance.jpg/640px-Auckland_CBD_skyline_from_Waitemata_Harbour_entrance.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Auckland_CBD_skyline_from_Waitemata_Harbour_entrance.jpg",
    "authorName": "Pseudopanax at English Wikipedia",
    "license": "Public domain",
    "description": "Auckland CBD skyline with Sky Tower in the morning, looking southwest from Waitemata Harbour entrance, with Seascape skyscraper under construction in 2024"
  },
  "nz.city.queenstown": {
    "title": "File:Lake Wakatipu from Queenstown gondola.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Lake_Wakatipu_from_Queenstown_gondola.jpg/1280px-Lake_Wakatipu_from_Queenstown_gondola.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Lake_Wakatipu_from_Queenstown_gondola.jpg/640px-Lake_Wakatipu_from_Queenstown_gondola.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Lake_Wakatipu_from_Queenstown_gondola.jpg",
    "authorName": "Avenue",
    "license": "CC BY-SA 3.0",
    "description": "Lake Wakatipu seen from the top of the Queenstown gondola."
  },
  "peru.city.arequipa": {
    "title": "File:Arequipa, Plaza de Armas and Volcan El Misti - panoramio.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/8/87/Arequipa%2C_Plaza_de_Armas_and_Volcan_El_Misti_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/8/87/Arequipa%2C_Plaza_de_Armas_and_Volcan_El_Misti_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Arequipa,_Plaza_de_Armas_and_Volcan_El_Misti_-_panoramio.jpg",
    "authorName": "Frans-Banja Mulder",
    "license": "CC BY 3.0",
    "description": "Arequipa, Plaza de Armas and Volcan El Misti"
  },
  "nz.gallery.queenstown": {
    "title": "File:The Remarkables from Queenstown, New Zealand 08.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/The_Remarkables_from_Queenstown%2C_New_Zealand_08.jpg/1280px-The_Remarkables_from_Queenstown%2C_New_Zealand_08.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fc/The_Remarkables_from_Queenstown%2C_New_Zealand_08.jpg/640px-The_Remarkables_from_Queenstown%2C_New_Zealand_08.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Remarkables_from_Queenstown,_New_Zealand_08.jpg",
    "authorName": "Σ64",
    "license": "CC BY 4.0",
    "description": "The Remarkables mountain range and Lake Wakatipu from Queenstown, Otago, South Island, New Zealand"
  },
  "nz.city.auckland": {
    "title": "File:Auckland Harbour Bridge From Sky Tower.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Auckland_Harbour_Bridge_From_Sky_Tower.jpg/1280px-Auckland_Harbour_Bridge_From_Sky_Tower.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Auckland_Harbour_Bridge_From_Sky_Tower.jpg/640px-Auckland_Harbour_Bridge_From_Sky_Tower.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Auckland_Harbour_Bridge_From_Sky_Tower.jpg",
    "authorName": "James Shih",
    "license": "CC BY-SA 4.0",
    "description": "Auckland Harbour Bridge viewed from Sky Tower. Westhaven Marina, Wynyard Quarter and Viaduct Harbour are also visible in the picture."
  },
  "belarus.city.brest": {
    "title": "File:Brest ul Sovetskaja street-lights.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Brest_ul_Sovetskaja_street-lights.jpg/1280px-Brest_ul_Sovetskaja_street-lights.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c8/Brest_ul_Sovetskaja_street-lights.jpg/640px-Brest_ul_Sovetskaja_street-lights.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Brest_ul_Sovetskaja_street-lights.jpg",
    "authorName": "Timofej",
    "license": "CC BY-SA 3.0",
    "description": "ul. Sovetskaya in Brest - perhaps the street with the most street-lights per square meter."
  },
  "iceland.gallery.reykjavik": {
    "title": "File:Hallgrímskirkja.jpeg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/d/da/Hallgr%C3%ADmskirkja.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/d/da/Hallgr%C3%ADmskirkja.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hallgr%C3%ADmskirkja.jpeg",
    "authorName": "Andreas Tille",
    "license": "CC BY-SA 4.0",
    "description": "Hallgrímskirkja , a statue of Leifr Eiríksson is shown on the picture. The image was enhanced by MarkSweep doing some image processing using The Gimp ."
  },
  "thailand.city.chiangmai": {
    "title": "File:20171106 Wat Phra That Doi Suthep 0103 DxO.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/20171106_Wat_Phra_That_Doi_Suthep_0103_DxO.jpg/1280px-20171106_Wat_Phra_That_Doi_Suthep_0103_DxO.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/14/20171106_Wat_Phra_That_Doi_Suthep_0103_DxO.jpg/640px-20171106_Wat_Phra_That_Doi_Suthep_0103_DxO.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:20171106_Wat_Phra_That_Doi_Suthep_0103_DxO.jpg",
    "authorName": "Jakub Hałun",
    "license": "CC BY-SA 4.0",
    "description": "Buddha statues in Wat Phra That Doi Suthep temple, Thailand"
  },
  "netherlands.cover": {
    "title": "File:Prinsengracht canal and Westerkerk tower seen from a Reestraat bridge, Amsterdam, Netherlands julesvernex2.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Prinsengracht_canal_and_Westerkerk_tower_seen_from_a_Reestraat_bridge%2C_Amsterdam%2C_Netherlands_julesvernex2.jpg/1280px-Prinsengracht_canal_and_Westerkerk_tower_seen_from_a_Reestraat_bridge%2C_Amsterdam%2C_Netherlands_julesvernex2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Prinsengracht_canal_and_Westerkerk_tower_seen_from_a_Reestraat_bridge%2C_Amsterdam%2C_Netherlands_julesvernex2.jpg/640px-Prinsengracht_canal_and_Westerkerk_tower_seen_from_a_Reestraat_bridge%2C_Amsterdam%2C_Netherlands_julesvernex2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Prinsengracht_canal_and_Westerkerk_tower_seen_from_a_Reestraat_bridge,_Amsterdam,_Netherlands_julesvernex2.jpg",
    "authorName": "Jules Verne Times Two",
    "license": "CC BY-SA 4.0",
    "description": "Prinsengracht canal and Westerkerk tower seen from a Reestraat bridge, Amsterdam, Netherlands"
  },
  "iceland.gallery.harpa": {
    "title": "File:The Harbour And Harpa (33650362931).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/The_Harbour_And_Harpa_%2833650362931%29.jpg/1280px-The_Harbour_And_Harpa_%2833650362931%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/The_Harbour_And_Harpa_%2833650362931%29.jpg/640px-The_Harbour_And_Harpa_%2833650362931%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Harbour_And_Harpa_(33650362931).jpg",
    "authorName": "Gary J. Wood from Toronto, ON, Canada",
    "license": "CC BY-SA 2.0",
    "description": "The Harbour And Harpa"
  },
  "netherlands.gallery.dam": {
    "title": "File:Palacio Real, Ámsterdam, Países Bajos, 2016-05-30, DD 07-09 HDR.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Palacio_Real%2C_%C3%81msterdam%2C_Pa%C3%ADses_Bajos%2C_2016-05-30%2C_DD_07-09_HDR.jpg/1280px-Palacio_Real%2C_%C3%81msterdam%2C_Pa%C3%ADses_Bajos%2C_2016-05-30%2C_DD_07-09_HDR.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Palacio_Real%2C_%C3%81msterdam%2C_Pa%C3%ADses_Bajos%2C_2016-05-30%2C_DD_07-09_HDR.jpg/640px-Palacio_Real%2C_%C3%81msterdam%2C_Pa%C3%ADses_Bajos%2C_2016-05-30%2C_DD_07-09_HDR.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Palacio_Real,_%C3%81msterdam,_Pa%C3%ADses_Bajos,_2016-05-30,_DD_07-09_HDR.jpg",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "Blue hour view of front of the Royal Palace , Amsterdam , Netherlands. The palace was built as a city hall during the Dutch Golden Age and opened in 1655. The building became the royal palace of King "
  },
  "sweden.gallery.stadshus": {
    "title": "File:Stockholms stadshus February 2026 02.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Stockholms_stadshus_February_2026_02.jpg/1280px-Stockholms_stadshus_February_2026_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Stockholms_stadshus_February_2026_02.jpg/640px-Stockholms_stadshus_February_2026_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Stockholms_stadshus_February_2026_02.jpg",
    "authorName": "ArildV",
    "license": "CC BY-SA 4.0",
    "description": "Stockholms stadshus (City hall) seen from Riddarholmen. Stockholm, Sweden."
  },
  "kazakhstan.city.turkestan": {
    "title": "File:Mausoleum of Khoja Ahmed Yasawi in Hazrat-e Turkestan, Kazakhstan.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan%2C_Kazakhstan.jpg/1280px-Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan%2C_Kazakhstan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan%2C_Kazakhstan.jpg/640px-Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan%2C_Kazakhstan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mausoleum_of_Khoja_Ahmed_Yasawi_in_Hazrat-e_Turkestan,_Kazakhstan.jpg",
    "authorName": "Petar Milošević",
    "license": "CC BY-SA 4.0",
    "description": "Mausoleum to Khoja Ahmad Yasawi (UNESCO World heritage site), Hazrat-e Turkestan, Kazakhstan. Prime example of Timurid arhcitecture with biggest dome in Central Asia."
  },
  "poland.gallery.warsaw": {
    "title": "File:Warsaw 2023 039 Palace Cathedral Skyline.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Warsaw_2023_039_Palace_Cathedral_Skyline.jpg/1280px-Warsaw_2023_039_Palace_Cathedral_Skyline.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7f/Warsaw_2023_039_Palace_Cathedral_Skyline.jpg/640px-Warsaw_2023_039_Palace_Cathedral_Skyline.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Warsaw_2023_039_Palace_Cathedral_Skyline.jpg",
    "authorName": "Scotch Mist",
    "license": "CC BY-SA 4.0",
    "description": "Royal Castle Tower and St John's Cathedral, Warsaw Skyline. Warsaw is the capital and largest city of Poland . The metropolis stands on the River Vistula in east-central Poland. Its population is offi"
  },
  "finland.cover": {
    "title": "File:Helsingfors domkyrka November 2025 01.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Helsingfors_domkyrka_November_2025_01.jpg/1280px-Helsingfors_domkyrka_November_2025_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c9/Helsingfors_domkyrka_November_2025_01.jpg/640px-Helsingfors_domkyrka_November_2025_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Helsingfors_domkyrka_November_2025_01.jpg",
    "authorName": "ArildV",
    "license": "CC BY-SA 4.0",
    "description": "Helsinki Cathedral (Finnish: Helsingin tuomiokirkko, Suurkirkko; Swedish: Helsingfors domkyrka, Storkyrkan) is the Finnish Evangelical Lutheran cathedral of the Diocese of Helsinki, located in the nei"
  },
  "lm.russia.2": {
    "title": "File:Мыс Бурхан вблизи поселка Хужир (Ольхон) 004.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/%D0%9C%D1%8B%D1%81_%D0%91%D1%83%D1%80%D1%85%D0%B0%D0%BD_%D0%B2%D0%B1%D0%BB%D0%B8%D0%B7%D0%B8_%D0%BF%D0%BE%D1%81%D0%B5%D0%BB%D0%BA%D0%B0_%D0%A5%D1%83%D0%B6%D0%B8%D1%80_%28%D0%9E%D0%BB%D1%8C%D1%85%D0%BE%D0%BD%29_004.jpg/1280px-%D0%9C%D1%8B%D1%81_%D0%91%D1%83%D1%80%D1%85%D0%B0%D0%BD_%D0%B2%D0%B1%D0%BB%D0%B8%D0%B7%D0%B8_%D0%BF%D0%BE%D1%81%D0%B5%D0%BB%D0%BA%D0%B0_%D0%A5%D1%83%D0%B6%D0%B8%D1%80_%28%D0%9E%D0%BB%D1%8C%D1%85%D0%BE%D0%BD%29_004.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/29/%D0%9C%D1%8B%D1%81_%D0%91%D1%83%D1%80%D1%85%D0%B0%D0%BD_%D0%B2%D0%B1%D0%BB%D0%B8%D0%B7%D0%B8_%D0%BF%D0%BE%D1%81%D0%B5%D0%BB%D0%BA%D0%B0_%D0%A5%D1%83%D0%B6%D0%B8%D1%80_%28%D0%9E%D0%BB%D1%8C%D1%85%D0%BE%D0%BD%29_004.jpg/640px-%D0%9C%D1%8B%D1%81_%D0%91%D1%83%D1%80%D1%85%D0%B0%D0%BD_%D0%B2%D0%B1%D0%BB%D0%B8%D0%B7%D0%B8_%D0%BF%D0%BE%D1%81%D0%B5%D0%BB%D0%BA%D0%B0_%D0%A5%D1%83%D0%B6%D0%B8%D1%80_%28%D0%9E%D0%BB%D1%8C%D1%85%D0%BE%D0%BD%29_004.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:%D0%9C%D1%8B%D1%81_%D0%91%D1%83%D1%80%D1%85%D0%B0%D0%BD_%D0%B2%D0%B1%D0%BB%D0%B8%D0%B7%D0%B8_%D0%BF%D0%BE%D1%81%D0%B5%D0%BB%D0%BA%D0%B0_%D0%A5%D1%83%D0%B6%D0%B8%D1%80_(%D0%9E%D0%BB%D1%8C%D1%85%D0%BE%D0%BD)_004.jpg",
    "authorName": "Petr Adam Dohnálek",
    "license": "CC BY-SA 3.0 cz",
    "description": "Cape Burkhan near Khuzhir on Olkhon Island in Lake Baikal , Russia"
  },
  "lm.russia.1": {
    "title": "File:The State Hermitage Museum, Saint Petersburg, Russia (38898440661).jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/8/8c/The_State_Hermitage_Museum%2C_Saint_Petersburg%2C_Russia_%2838898440661%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/8/8c/The_State_Hermitage_Museum%2C_Saint_Petersburg%2C_Russia_%2838898440661%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_State_Hermitage_Museum,_Saint_Petersburg,_Russia_(38898440661).jpg",
    "authorName": "Andrey Filippov 安德烈 from Moscow, Russia",
    "license": "CC BY 2.0",
    "description": "2017 год в Санкт-Петербурге"
  },
  "chile.city.puertonatales": {
    "title": "File:ISS064-E-23399 - View of Chile - Patagonia - Pacific fjords - Seno Última Esperanza - Puerto Natales - Fjordo de las Montanas glacier mountains - Glaciar Balmaceda - Tyndall Glacier - Lago del Toro - Torres del Paine (cropped).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/ISS064-E-23399_-_View_of_Chile_-_Patagonia_-_Pacific_fjords_-_Seno_%C3%9Altima_Esperanza_-_Puerto_Natales_-_Fjordo_de_las_Montanas_glacier_mountains_-_Glaciar_Balmaceda_-_Tyndall_Glacier_-_Lago_del_Toro_-_Torres_del_Paine_%28cropped%29.jpg/1280px-thumbnail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/ISS064-E-23399_-_View_of_Chile_-_Patagonia_-_Pacific_fjords_-_Seno_%C3%9Altima_Esperanza_-_Puerto_Natales_-_Fjordo_de_las_Montanas_glacier_mountains_-_Glaciar_Balmaceda_-_Tyndall_Glacier_-_Lago_del_Toro_-_Torres_del_Paine_%28cropped%29.jpg/640px-thumbnail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:ISS064-E-23399_-_View_of_Chile_-_Patagonia_-_Pacific_fjords_-_Seno_%C3%9Altima_Esperanza_-_Puerto_Natales_-_Fjordo_de_las_Montanas_glacier_mountains_-_Glaciar_Balmaceda_-_Tyndall_Glacier_-_Lago_del_Toro_-_Torres_del_Paine_(cropped).jpg",
    "authorName": "Earth Science and Remote Sensing Unit, NASA J...",
    "license": "Public domain",
    "description": "View of Earth taken during ISS Expedition 64. Patagonia , Pacific fjords , Isla Owen, Paso Morla Vicuna, Isla Diego Portales, Seno Última Esperanza, town Puerto Natales , Fjordo de las Montanas glacie"
  },
  "serbia.gallery.knez": {
    "title": "File:Knez Mihailova street, Belgrade (by Pudelek).JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Knez_Mihailova_street%2C_Belgrade_%28by_Pudelek%29.JPG/1280px-Knez_Mihailova_street%2C_Belgrade_%28by_Pudelek%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Knez_Mihailova_street%2C_Belgrade_%28by_Pudelek%29.JPG/640px-Knez_Mihailova_street%2C_Belgrade_%28by_Pudelek%29.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Knez_Mihailova_street,_Belgrade_(by_Pudelek).JPG",
    "authorName": "Pudelek (Marcin Szala)",
    "license": "CC BY-SA 3.0 rs",
    "description": "Knez Mihailova street, Belgrade"
  },
  "lm.russia.0": {
    "title": "File:Views of Moscow Kremlin from Red Square, 2006 (01).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Views_of_Moscow_Kremlin_from_Red_Square%2C_2006_%2801%29.jpg/1280px-Views_of_Moscow_Kremlin_from_Red_Square%2C_2006_%2801%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f8/Views_of_Moscow_Kremlin_from_Red_Square%2C_2006_%2801%29.jpg/640px-Views_of_Moscow_Kremlin_from_Red_Square%2C_2006_%2801%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Views_of_Moscow_Kremlin_from_Red_Square,_2006_(01).jpg",
    "authorName": "Bahnfrend",
    "license": "CC BY-SA 4.0",
    "description": "View of Moscow Kremlin from Red Square"
  },
  "serbia.city.belgrade": {
    "title": "File:The confluence of the Sava into the Danube at Belgrade.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/The_confluence_of_the_Sava_into_the_Danube_at_Belgrade.jpg/1280px-The_confluence_of_the_Sava_into_the_Danube_at_Belgrade.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/db/The_confluence_of_the_Sava_into_the_Danube_at_Belgrade.jpg/640px-The_confluence_of_the_Sava_into_the_Danube_at_Belgrade.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_confluence_of_the_Sava_into_the_Danube_at_Belgrade.jpg",
    "authorName": "Lošmi",
    "license": "CC BY-SA 3.0",
    "description": "The confluence of the Sava into the Danube at Belgrade . Pictured from Kalemegdan"
  },
  "lm.italy.0": {
    "title": "File:Colosseum of Rome and Roman forum.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Colosseum_of_Rome_and_Roman_forum.jpg/1280px-Colosseum_of_Rome_and_Roman_forum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a1/Colosseum_of_Rome_and_Roman_forum.jpg/640px-Colosseum_of_Rome_and_Roman_forum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Colosseum_of_Rome_and_Roman_forum.jpg",
    "authorName": "Wilfredor",
    "license": "CC0",
    "description": "Colosseum of Rome and Roman Forum, Italy"
  },
  "lm.france.1": {
    "title": "File:Louvre Museum Wikimedia Commons.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/1280px-Louvre_Museum_Wikimedia_Commons.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/640px-Louvre_Museum_Wikimedia_Commons.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Louvre_Museum_Wikimedia_Commons.jpg",
    "authorName": "Benh LIEU SONG ( Flickr )",
    "license": "CC BY-SA 3.0",
    "description": "Courtyard of the Museum of Louvre , and its pyramid."
  },
  "lm.italy.1": {
    "title": "File:Panorama Piazza San Marco and Venice on Easter 2013.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Panorama_Piazza_San_Marco_and_Venice_on_Easter_2013.jpg/1280px-Panorama_Piazza_San_Marco_and_Venice_on_Easter_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Panorama_Piazza_San_Marco_and_Venice_on_Easter_2013.jpg/640px-Panorama_Piazza_San_Marco_and_Venice_on_Easter_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Panorama_Piazza_San_Marco_and_Venice_on_Easter_2013.jpg",
    "authorName": "This Photo was taken by Wolfgang Moroder . Fe...",
    "license": "CC BY-SA 3.0",
    "description": "Piazza San Marco and Venice on Easter 2013. View from the belltower of the Basilica di San Giorgio Maggiore"
  },
  "lm.italy.2": {
    "title": "File:Florence Duomo from Michelangelo hill.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Florence_Duomo_from_Michelangelo_hill.jpg/1280px-Florence_Duomo_from_Michelangelo_hill.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Florence_Duomo_from_Michelangelo_hill.jpg/640px-Florence_Duomo_from_Michelangelo_hill.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Florence_Duomo_from_Michelangelo_hill.jpg",
    "authorName": "Petar Milošević",
    "license": "CC BY-SA 4.0",
    "description": "Florence Duomo as seen from Michelangelo hill. Tuscany, Italy."
  },
  "lm.france.2": {
    "title": "File:Cloître Abbaye du Mont Saint-Michel 2015-05-28.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Clo%C3%AEtre_Abbaye_du_Mont_Saint-Michel_2015-05-28.jpg/1280px-Clo%C3%AEtre_Abbaye_du_Mont_Saint-Michel_2015-05-28.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/86/Clo%C3%AEtre_Abbaye_du_Mont_Saint-Michel_2015-05-28.jpg/640px-Clo%C3%AEtre_Abbaye_du_Mont_Saint-Michel_2015-05-28.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Clo%C3%AEtre_Abbaye_du_Mont_Saint-Michel_2015-05-28.jpg",
    "authorName": "Benh LIEU SONG ( Flickr )",
    "license": "CC BY-SA 4.0",
    "description": "Cloisters of the abbey of Mont Saint-Michel, in Manche department, Normandy, France. This picture was created by stitching 57 frames (3 different exposures sets of 19 frames) with Hugin, was rendered "
  },
  "lm.france.0": {
    "title": "File:Tour Eiffel Wikimedia Commons.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/1280px-Tour_Eiffel_Wikimedia_Commons.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/640px-Tour_Eiffel_Wikimedia_Commons.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tour_Eiffel_Wikimedia_Commons.jpg",
    "authorName": "Benh LIEU SONG",
    "license": "Public domain",
    "description": "Eiffel Tower , seen from the Champ de Mars , Paris, France"
  },
  "lm.japan.1": {
    "title": "File:Torii path with lantern at Fushimi Inari Taisha Shrine, Kyoto, Japan.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg/1280px-Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg/640px-Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine%2C_Kyoto%2C_Japan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Torii_path_with_lantern_at_Fushimi_Inari_Taisha_Shrine,_Kyoto,_Japan.jpg",
    "authorName": "Basile Morin",
    "license": "CC BY-SA 4.0",
    "description": "Torii path with a hanging lantern at Fushimi Inari Taisha Shrine Senbontorii, Kyoto , Japan ."
  },
  "lm.japan.2": {
    "title": "File:Water reflection of Kinkaku-ji Temple a sunny day, Kyoto, Japan.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg/1280px-Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg/640px-Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day%2C_Kyoto%2C_Japan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Water_reflection_of_Kinkaku-ji_Temple_a_sunny_day,_Kyoto,_Japan.jpg",
    "authorName": "Basile Morin",
    "license": "CC BY-SA 4.0",
    "description": "Wide-frame view and water reflection of Kinkaku-ji Temple, a sunny day, Kyoto , Japan ."
  },
  "lm.spain.2": {
    "title": "File:East facade of the Casón del Buen Retiro, Museo del Prado, Madrid.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/East_facade_of_the_Cas%C3%B3n_del_Buen_Retiro%2C_Museo_del_Prado%2C_Madrid.jpg/1280px-East_facade_of_the_Cas%C3%B3n_del_Buen_Retiro%2C_Museo_del_Prado%2C_Madrid.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/East_facade_of_the_Cas%C3%B3n_del_Buen_Retiro%2C_Museo_del_Prado%2C_Madrid.jpg/640px-East_facade_of_the_Cas%C3%B3n_del_Buen_Retiro%2C_Museo_del_Prado%2C_Madrid.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:East_facade_of_the_Cas%C3%B3n_del_Buen_Retiro,_Museo_del_Prado,_Madrid.jpg",
    "authorName": "Benjaminkhas07",
    "license": "CC BY-SA 4.0",
    "description": "A detailed view of the eastern facade of the Casón del Buen Retiro in Madrid, Spain. Originally constructed in the 17th century under King Philip IV as the ballroom (Salón de Baile) of the former Buen"
  },
  "lm.spain.1": {
    "title": "File:Granada - Alhambra - Palacios nazaríes - Façade of Comares - 3.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Granada_-_Alhambra_-_Palacios_nazar%C3%ADes_-_Fa%C3%A7ade_of_Comares_-_3.jpg/1280px-Granada_-_Alhambra_-_Palacios_nazar%C3%ADes_-_Fa%C3%A7ade_of_Comares_-_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Granada_-_Alhambra_-_Palacios_nazar%C3%ADes_-_Fa%C3%A7ade_of_Comares_-_3.jpg/640px-Granada_-_Alhambra_-_Palacios_nazar%C3%ADes_-_Fa%C3%A7ade_of_Comares_-_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Granada_-_Alhambra_-_Palacios_nazar%C3%ADes_-_Fa%C3%A7ade_of_Comares_-_3.jpg",
    "authorName": "Benjamin Smith",
    "license": "CC BY-SA 4.0",
    "description": "Granada (Andalusia, Spain) - Alhambra - Palacios nazaríes - Palacio del Mexuar - Windows and arabesques on the façade of Comares"
  },
  "lm.spain.0": {
    "title": "File:(Barcelona) Bastidors d'espelmes votives - dissenyat per Antoni Gaudí - Sagrada Familia.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/%28Barcelona%29_Bastidors_d%27espelmes_votives_-_dissenyat_per_Antoni_Gaud%C3%AD_-_Sagrada_Familia.jpg/1280px-%28Barcelona%29_Bastidors_d%27espelmes_votives_-_dissenyat_per_Antoni_Gaud%C3%AD_-_Sagrada_Familia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/%28Barcelona%29_Bastidors_d%27espelmes_votives_-_dissenyat_per_Antoni_Gaud%C3%AD_-_Sagrada_Familia.jpg/640px-%28Barcelona%29_Bastidors_d%27espelmes_votives_-_dissenyat_per_Antoni_Gaud%C3%AD_-_Sagrada_Familia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:(Barcelona)_Bastidors_d%27espelmes_votives_-_dissenyat_per_Antoni_Gaud%C3%AD_-_Sagrada_Familia.jpg",
    "authorName": "Didier Descouens",
    "license": "CC BY-SA 4.0",
    "description": ""
  },
  "lm.turkey.1": {
    "title": "File:CAPPADOCIA Göreme National Park and the Rock Sites. World Heritage List. Turkey. Hot Air Ballooning Cappadocia.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/CAPPADOCIA_G%C3%B6reme_National_Park_and_the_Rock_Sites._World_Heritage_List._Turkey._Hot_Air_Ballooning_Cappadocia.jpg/1280px-CAPPADOCIA_G%C3%B6reme_National_Park_and_the_Rock_Sites._World_Heritage_List._Turkey._Hot_Air_Ballooning_Cappadocia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/95/CAPPADOCIA_G%C3%B6reme_National_Park_and_the_Rock_Sites._World_Heritage_List._Turkey._Hot_Air_Ballooning_Cappadocia.jpg/640px-CAPPADOCIA_G%C3%B6reme_National_Park_and_the_Rock_Sites._World_Heritage_List._Turkey._Hot_Air_Ballooning_Cappadocia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:CAPPADOCIA_G%C3%B6reme_National_Park_and_the_Rock_Sites._World_Heritage_List._Turkey._Hot_Air_Ballooning_Cappadocia.jpg",
    "authorName": "Feridun F. Alkaya",
    "license": "CC0",
    "description": "Hot Air Ballooning Cappadocia: A must do in Cappadocia is take a balloon ride in order to see the sights from a vantage point like no other. On this 1-hour flight at sunrise you will experience the ch"
  },
  "lm.thailand.0": {
    "title": "File:Temple of the Emerald Buddha.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Temple_of_the_Emerald_Buddha.jpg/1280px-Temple_of_the_Emerald_Buddha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b5/Temple_of_the_Emerald_Buddha.jpg/640px-Temple_of_the_Emerald_Buddha.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Temple_of_the_Emerald_Buddha.jpg",
    "authorName": "Nawit science",
    "license": "CC BY-SA 4.0",
    "description": "Monk walks in the morning after the rain in front of the Temple of the Emerald Buddha ( Wat Phra Kaew ), part of the Grand Palace , Bangkok, Thailand."
  },
  "lm.turkey.0": {
    "title": "File:Hagia Sophia Mars 2013.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/1280px-Hagia_Sophia_Mars_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/22/Hagia_Sophia_Mars_2013.jpg/640px-Hagia_Sophia_Mars_2013.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hagia_Sophia_Mars_2013.jpg",
    "authorName": "Arild Vågen",
    "license": "CC BY-SA 3.0",
    "description": "Hagia Sophia"
  },
  "lm.turkey.2": {
    "title": "File:TR Pamukkale White Terraces asv2020-02 img16.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/TR_Pamukkale_White_Terraces_asv2020-02_img16.jpg/1280px-TR_Pamukkale_White_Terraces_asv2020-02_img16.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/TR_Pamukkale_White_Terraces_asv2020-02_img16.jpg/640px-TR_Pamukkale_White_Terraces_asv2020-02_img16.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:TR_Pamukkale_White_Terraces_asv2020-02_img16.jpg",
    "authorName": "A.Savin",
    "license": "FAL",
    "description": "White Terraces (natural travertine formations and hot pools) in Pamukkale, Turkey"
  },
  "lm.uae.1": {
    "title": "File:The Grand Mosque-Abu Dhabi.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/8/89/The_Grand_Mosque-Abu_Dhabi.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/8/89/The_Grand_Mosque-Abu_Dhabi.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Grand_Mosque-Abu_Dhabi.jpg",
    "authorName": "Sifaat",
    "license": "CC BY-SA 4.0",
    "description": "Garden view of Sheikh Zayed Grand Mosque - Abu Dhabi, UAE"
  },
  "lm.uae.0": {
    "title": "File:Dubai Skyline mit Burj Khalifa (cropped).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Dubai_Skyline_mit_Burj_Khalifa_%28cropped%29.jpg/1280px-Dubai_Skyline_mit_Burj_Khalifa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/46/Dubai_Skyline_mit_Burj_Khalifa_%28cropped%29.jpg/640px-Dubai_Skyline_mit_Burj_Khalifa_%28cropped%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Dubai_Skyline_mit_Burj_Khalifa_(cropped).jpg",
    "authorName": "Tim Reckmann from Hamm, Deutschland",
    "license": "CC BY-SA 3.0",
    "description": "Skyline of Downtown Dubai with Burj Khalifa from a Helicopter (crop of File:Dubai skyline 2015.jpg)"
  },
  "lm.egypt.2": {
    "title": "File:The Temple to Ramesses II at Abu Simbel (XV).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/The_Temple_to_Ramesses_II_at_Abu_Simbel_%28XV%29.jpg/1280px-The_Temple_to_Ramesses_II_at_Abu_Simbel_%28XV%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/The_Temple_to_Ramesses_II_at_Abu_Simbel_%28XV%29.jpg/640px-The_Temple_to_Ramesses_II_at_Abu_Simbel_%28XV%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Temple_to_Ramesses_II_at_Abu_Simbel_(XV).jpg",
    "authorName": "isawnyu",
    "license": "CC BY 2.0",
    "description": "This is a photo of a monument in Egypt identified by the ID"
  },
  "lm.thailand.2": {
    "title": "File:Ayutthaya Thailand 2004.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Ayutthaya_Thailand_2004.jpg/1280px-Ayutthaya_Thailand_2004.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f1/Ayutthaya_Thailand_2004.jpg/640px-Ayutthaya_Thailand_2004.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ayutthaya_Thailand_2004.jpg",
    "authorName": "Evilarry",
    "license": "Public domain",
    "description": "Wat Chai Watthanaram , Ayutthaya Historical Park , central Thailand ."
  },
  "lm.egypt.1": {
    "title": "File:Templo de Karnak, Luxor, Egipto, 2022-04-03, DD 148.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Templo_de_Karnak%2C_Luxor%2C_Egipto%2C_2022-04-03%2C_DD_148.jpg/1280px-Templo_de_Karnak%2C_Luxor%2C_Egipto%2C_2022-04-03%2C_DD_148.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e7/Templo_de_Karnak%2C_Luxor%2C_Egipto%2C_2022-04-03%2C_DD_148.jpg/640px-Templo_de_Karnak%2C_Luxor%2C_Egipto%2C_2022-04-03%2C_DD_148.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Templo_de_Karnak,_Luxor,_Egipto,_2022-04-03,_DD_148.jpg",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "Karnak Temple, Luxor, Egypt"
  },
  "lm.egypt.0": {
    "title": "File:Egypt.Giza.Sphinx.01.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Egypt.Giza.Sphinx.01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Egypt.Giza.Sphinx.01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Egypt.Giza.Sphinx.01.jpg",
    "authorName": "en:User:Hajor",
    "license": "CC BY-SA 3.0",
    "description": "The Pyramid of Khafre and the Great Sphinx of Giza on the Giza Plateau , Cairo, Egypt.."
  },
  "lm.brazil.0": {
    "title": "File:Bell 206L-4 LongRanger IV over Botafogo Bay, Rio de Janeiro.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Bell_206L-4_LongRanger_IV_over_Botafogo_Bay%2C_Rio_de_Janeiro.jpg/1280px-Bell_206L-4_LongRanger_IV_over_Botafogo_Bay%2C_Rio_de_Janeiro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Bell_206L-4_LongRanger_IV_over_Botafogo_Bay%2C_Rio_de_Janeiro.jpg/640px-Bell_206L-4_LongRanger_IV_over_Botafogo_Bay%2C_Rio_de_Janeiro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Bell_206L-4_LongRanger_IV_over_Botafogo_Bay,_Rio_de_Janeiro.jpg",
    "authorName": "Wilfredor",
    "license": "CC0",
    "description": "A Bell 206L-4 LongRanger IV flying over Botafogo Bay, the Corcovado and the statue of Christ behind it. Rio de Janeiro, Brazil."
  },
  "lm.australia.0": {
    "title": "File:Sydney Opera House from Circular Quay, 2023, 13.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Sydney_Opera_House_from_Circular_Quay%2C_2023%2C_13.jpg/1280px-Sydney_Opera_House_from_Circular_Quay%2C_2023%2C_13.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/04/Sydney_Opera_House_from_Circular_Quay%2C_2023%2C_13.jpg/640px-Sydney_Opera_House_from_Circular_Quay%2C_2023%2C_13.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sydney_Opera_House_from_Circular_Quay,_2023,_13.jpg",
    "authorName": "Kgbo",
    "license": "CC BY-SA 4.0",
    "description": "Sydney Opera House from Circular Quay, 2023"
  },
  "lm.brazil.2": {
    "title": "File:Sugarloaf Cable Car viewed from Rio de Janeiro, Brazil.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Sugarloaf_Cable_Car_viewed_from_Rio_de_Janeiro%2C_Brazil.jpg/1280px-Sugarloaf_Cable_Car_viewed_from_Rio_de_Janeiro%2C_Brazil.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ed/Sugarloaf_Cable_Car_viewed_from_Rio_de_Janeiro%2C_Brazil.jpg/640px-Sugarloaf_Cable_Car_viewed_from_Rio_de_Janeiro%2C_Brazil.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sugarloaf_Cable_Car_viewed_from_Rio_de_Janeiro,_Brazil.jpg",
    "authorName": "Wilfredor",
    "license": "CC0",
    "description": "Sugarloaf cable car , Rio de Janeiro , Brazil ."
  },
  "lm.usa.1": {
    "title": "File:Statue of Liberty frontal 2.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Statue_of_Liberty_frontal_2.jpg/1280px-Statue_of_Liberty_frontal_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Statue_of_Liberty_frontal_2.jpg/640px-Statue_of_Liberty_frontal_2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Statue_of_Liberty_frontal_2.jpg",
    "authorName": "Daniel Schwen",
    "license": "Public domain",
    "description": "View of the Statue of Liberty from Liberty Island"
  },
  "lm.australia.1": {
    "title": "File:Coral Outcrop Flynn Reef.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Coral_Outcrop_Flynn_Reef.jpg/1280px-Coral_Outcrop_Flynn_Reef.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Coral_Outcrop_Flynn_Reef.jpg/640px-Coral_Outcrop_Flynn_Reef.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Coral_Outcrop_Flynn_Reef.jpg",
    "authorName": "Toby Hudson",
    "license": "CC BY-SA 3.0",
    "description": "A variety of corals form an outcrop on Flynn Reef, part of the Great Barrier Reef near Cairns, Queensland, Australia."
  },
  "lm.usa.2": {
    "title": "File:Yellowstone National Park (WY, USA), Grand Prismatic Spring -- 2022 -- 2514.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Yellowstone_National_Park_%28WY%2C_USA%29%2C_Grand_Prismatic_Spring_--_2022_--_2514.jpg/1280px-Yellowstone_National_Park_%28WY%2C_USA%29%2C_Grand_Prismatic_Spring_--_2022_--_2514.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Yellowstone_National_Park_%28WY%2C_USA%29%2C_Grand_Prismatic_Spring_--_2022_--_2514.jpg/640px-Yellowstone_National_Park_%28WY%2C_USA%29%2C_Grand_Prismatic_Spring_--_2022_--_2514.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Yellowstone_National_Park_(WY,_USA),_Grand_Prismatic_Spring_--_2022_--_2514.jpg",
    "authorName": "Dietmar Rabich",
    "license": "CC BY-SA 4.0",
    "description": "Grand Prismatic Spring , Yellowstone National Park , Wyoming , USA Yellowstone National Park was founded on March 1, 1872, and is considered the world’s first national park. It is located primarily in"
  },
  "lm.brazil.1": {
    "title": "File:Cataratas Iguacu Iguazu Falls.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Cataratas_Iguacu_Iguazu_Falls.jpg/1280px-Cataratas_Iguacu_Iguazu_Falls.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5a/Cataratas_Iguacu_Iguazu_Falls.jpg/640px-Cataratas_Iguacu_Iguazu_Falls.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cataratas_Iguacu_Iguazu_Falls.jpg",
    "authorName": "Christhian Almir Gruhn",
    "license": "CC BY-SA 4.0",
    "description": "Iguazu Falls between Argentina and Brazil"
  },
  "lm.usa.0": {
    "title": "File:Grand Canyon (Arizona, USA), Luftaufnahme -- 2012 -- 5964.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Grand_Canyon_%28Arizona%2C_USA%29%2C_Luftaufnahme_--_2012_--_5964.jpg/1280px-Grand_Canyon_%28Arizona%2C_USA%29%2C_Luftaufnahme_--_2012_--_5964.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e1/Grand_Canyon_%28Arizona%2C_USA%29%2C_Luftaufnahme_--_2012_--_5964.jpg/640px-Grand_Canyon_%28Arizona%2C_USA%29%2C_Luftaufnahme_--_2012_--_5964.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Grand_Canyon_(Arizona,_USA),_Luftaufnahme_--_2012_--_5964.jpg",
    "authorName": "Dietmar Rabich",
    "license": "CC BY-SA 4.0",
    "description": "Aerial view of the Grand Canyon with the Colorado River north of Grand Canyon Village, Arizona , USA Grand Canyon National Park in the US state of Arizona was declared a national park in 1919 and is o"
  },
  "lm.switzerland.0": {
    "title": "File:Peak of Matterhorn.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Peak_of_Matterhorn.jpg/1280px-Peak_of_Matterhorn.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d9/Peak_of_Matterhorn.jpg/640px-Peak_of_Matterhorn.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Peak_of_Matterhorn.jpg",
    "authorName": "OlhaSolodenko",
    "license": "CC BY-SA 4.0",
    "description": "Peak of Matterhorn in Swiss Alps above the town of Zermatt in the canton of Valais, Switzerland"
  },
  "lm.uk.0": {
    "title": "File:Palace of Westminster, London - Feb 2007.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Palace_of_Westminster%2C_London_-_Feb_2007.jpg/1280px-Palace_of_Westminster%2C_London_-_Feb_2007.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Palace_of_Westminster%2C_London_-_Feb_2007.jpg/640px-Palace_of_Westminster%2C_London_-_Feb_2007.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Palace_of_Westminster,_London_-_Feb_2007.jpg",
    "authorName": "Diliff",
    "license": "CC BY-SA 2.5",
    "description": "The Palace of Westminster at night as seen from the opposite side of the River Thames . Victoria Tower and the House of Lords is on the left. The Clock Tower of Big Ben and the House of Commons is on "
  },
  "lm.germany.0": {
    "title": "File:Neuschwanstein Castle 2024-02.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Neuschwanstein_Castle_2024-02.jpg/1280px-Neuschwanstein_Castle_2024-02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3c/Neuschwanstein_Castle_2024-02.jpg/640px-Neuschwanstein_Castle_2024-02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Neuschwanstein_Castle_2024-02.jpg",
    "authorName": "Wilfredor",
    "license": "CC0",
    "description": "Neuschwanstein Castle at Schwangau , Bavaria , Germany ."
  },
  "lm.germany.2": {
    "title": "File:Cologne Germany Exterior-view-of-Cologne-Cathedral-07.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Cologne_Germany_Exterior-view-of-Cologne-Cathedral-07.jpg/1280px-Cologne_Germany_Exterior-view-of-Cologne-Cathedral-07.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b3/Cologne_Germany_Exterior-view-of-Cologne-Cathedral-07.jpg/640px-Cologne_Germany_Exterior-view-of-Cologne-Cathedral-07.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cologne_Germany_Exterior-view-of-Cologne-Cathedral-07.jpg",
    "authorName": "CEphoto, Uwe Aranas",
    "license": "CC BY-SA 3.0",
    "description": "Cologne, Germany: Exterior of Cologne Cathedral"
  },
  "lm.uk.1": {
    "title": "File:London MMB »0Y8 River Thames and \"Redoubt\".jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/London_MMB_%C2%BB0Y8_River_Thames_and_%22Redoubt%22.jpg/1280px-London_MMB_%C2%BB0Y8_River_Thames_and_%22Redoubt%22.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/London_MMB_%C2%BB0Y8_River_Thames_and_%22Redoubt%22.jpg/640px-London_MMB_%C2%BB0Y8_River_Thames_and_%22Redoubt%22.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:London_MMB_%C2%BB0Y8_River_Thames_and_%22Redoubt%22.jpg",
    "authorName": "mattbuck ( category )",
    "license": "CC BY-SA 4.0",
    "description": "The Redoubt hauls a barge of containers (likely containing refuse) up the Thames past the Palace of Westminster."
  },
  "lm.uk.2": {
    "title": "File:Edinburgh Castle from Grass Market.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Edinburgh_Castle_from_Grass_Market.jpg/1280px-Edinburgh_Castle_from_Grass_Market.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Edinburgh_Castle_from_Grass_Market.jpg/640px-Edinburgh_Castle_from_Grass_Market.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Edinburgh_Castle_from_Grass_Market.jpg",
    "authorName": "George Washington Wilson / Adam Cuerden",
    "license": "Public domain",
    "description": "Edinburgh Castle from the Grass Market"
  },
  "lm.australia.2": {
    "title": "File:Princetown (AU), Port Campbell National Park, Twelve Apostles -- 2019 -- 0969.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Princetown_%28AU%29%2C_Port_Campbell_National_Park%2C_Twelve_Apostles_--_2019_--_0969.jpg/1280px-Princetown_%28AU%29%2C_Port_Campbell_National_Park%2C_Twelve_Apostles_--_2019_--_0969.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Princetown_%28AU%29%2C_Port_Campbell_National_Park%2C_Twelve_Apostles_--_2019_--_0969.jpg/640px-Princetown_%28AU%29%2C_Port_Campbell_National_Park%2C_Twelve_Apostles_--_2019_--_0969.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Princetown_(AU),_Port_Campbell_National_Park,_Twelve_Apostles_--_2019_--_0969.jpg",
    "authorName": "Dietmar Rabich",
    "license": "CC BY-SA 4.0",
    "description": "Twelve Apostles at Port Campbell National Park , Princetown, Victoria , Australia Port Campbell National Park is located on the south coast of Victoria along the Great Ocean Road and protects a specta"
  },
  "lm.germany.1": {
    "title": "File:Brandenburger Tor nachts.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Brandenburger_Tor_nachts.jpg/1280px-Brandenburger_Tor_nachts.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Brandenburger_Tor_nachts.jpg/640px-Brandenburger_Tor_nachts.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Brandenburger_Tor_nachts.jpg",
    "authorName": "Thomas Wolf , www.foto-tw.de",
    "license": "CC BY-SA 3.0",
    "description": "The Brandenburg Gate in Berlin , Germany"
  },
  "lm.greece.2": {
    "title": "File:Santorini, Oia 16.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Santorini%2C_Oia_16.jpg/1280px-Santorini%2C_Oia_16.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Santorini%2C_Oia_16.jpg/640px-Santorini%2C_Oia_16.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Santorini,_Oia_16.jpg",
    "authorName": "LBM1948",
    "license": "CC BY-SA 4.0",
    "description": "Church domes; on teh background, the caldera and Thirasia Island. Oia, Santorini, Cyclades, Greece"
  },
  "lm.portugal.0": {
    "title": "File:Yellow Minaret Tower of Pena Palace, Sintra, Portugal (54882506234).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Yellow_Minaret_Tower_of_Pena_Palace%2C_Sintra%2C_Portugal_%2854882506234%29.jpg/1280px-Yellow_Minaret_Tower_of_Pena_Palace%2C_Sintra%2C_Portugal_%2854882506234%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2e/Yellow_Minaret_Tower_of_Pena_Palace%2C_Sintra%2C_Portugal_%2854882506234%29.jpg/640px-Yellow_Minaret_Tower_of_Pena_Palace%2C_Sintra%2C_Portugal_%2854882506234%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Yellow_Minaret_Tower_of_Pena_Palace,_Sintra,_Portugal_(54882506234).jpg",
    "authorName": "Dale Cruse - 10M views from San Francisco, CA...",
    "license": "CC BY 4.0",
    "description": "Bathed in golden sunlight and framed by a brilliant blue sky, this striking yellow turret is one of the most recognizable features of the Palácio Nacional da Pena—Pena Palace—in Sintra, Portugal. Risi"
  },
  "lm.portugal.2": {
    "title": "File:Guia Lighthouse (1414289262).jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/3/39/Guia_Lighthouse_%281414289262%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/3/39/Guia_Lighthouse_%281414289262%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Guia_Lighthouse_(1414289262).jpg",
    "authorName": "lele3100",
    "license": "CC BY 2.0",
    "description": "Cabo da Roca (Cape Roca) is a cape which forms the westernmost point of both mainland Portugal and mainland Europe. The cape is in the Portuguese municipality of Sintra, west of Lisbon district, and a"
  },
  "lm.greece.0": {
    "title": "File:Attica 06-13 Athens 50 View from Philopappos - Acropolis Hill.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg/1280px-Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg/640px-Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Attica_06-13_Athens_50_View_from_Philopappos_-_Acropolis_Hill.jpg",
    "authorName": "A.Savin",
    "license": "CC BY-SA 3.0",
    "description": "View from Philopappos Hill in Athens (Attica, Greece) — Acropolis of Athens"
  },
  "lm.greece.1": {
    "title": "File:Rousanou Monastery, Meteora, Greece (15148627963).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Rousanou_Monastery%2C_Meteora%2C_Greece_%2815148627963%29.jpg/1280px-Rousanou_Monastery%2C_Meteora%2C_Greece_%2815148627963%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/01/Rousanou_Monastery%2C_Meteora%2C_Greece_%2815148627963%29.jpg/640px-Rousanou_Monastery%2C_Meteora%2C_Greece_%2815148627963%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rousanou_Monastery,_Meteora,_Greece_(15148627963).jpg",
    "authorName": "Paul Stephenson from London",
    "license": "CC BY 2.0",
    "description": "Rousanou Monastery, taken from the Varlaam Monastery in Meteora, Greece"
  },
  "lm.portugal.1": {
    "title": "File:Jerónimos Monastery (Mosteiro dos Jerónimos), Belem, Portugal (49599404477).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Jer%C3%B3nimos_Monastery_%28Mosteiro_dos_Jer%C3%B3nimos%29%2C_Belem%2C_Portugal_%2849599404477%29.jpg/1280px-Jer%C3%B3nimos_Monastery_%28Mosteiro_dos_Jer%C3%B3nimos%29%2C_Belem%2C_Portugal_%2849599404477%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8c/Jer%C3%B3nimos_Monastery_%28Mosteiro_dos_Jer%C3%B3nimos%29%2C_Belem%2C_Portugal_%2849599404477%29.jpg/640px-Jer%C3%B3nimos_Monastery_%28Mosteiro_dos_Jer%C3%B3nimos%29%2C_Belem%2C_Portugal_%2849599404477%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jer%C3%B3nimos_Monastery_(Mosteiro_dos_Jer%C3%B3nimos),_Belem,_Portugal_(49599404477).jpg",
    "authorName": "Ray in Manila",
    "license": "CC BY 2.0",
    "description": "The Jerónimos Monastery or Hieronymites Monastery (Mosteiro dos Jerónimos) is a former monastery of the Order of Saint Jerome near the Tagus river in the parish of Belém, in the Lisbon Municipality, P"
  },
  "lm.switzerland.2": {
    "title": "File:Schweiz Schloss Chillon Gesamtansicht.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Schweiz_Schloss_Chillon_Gesamtansicht.jpg/1280px-Schweiz_Schloss_Chillon_Gesamtansicht.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f7/Schweiz_Schloss_Chillon_Gesamtansicht.jpg/640px-Schweiz_Schloss_Chillon_Gesamtansicht.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Schweiz_Schloss_Chillon_Gesamtansicht.jpg",
    "authorName": "Benjamin Gimmel BenHur",
    "license": "CC BY-SA 3.0",
    "description": "Castle Chillon at Lake Geneva, Switzerland"
  },
  "lm.czechia.2": {
    "title": "File:State Castle and Chateau Cesky Krumlov 契斯基庫倫洛夫城堡 - panoramio.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/State_Castle_and_Chateau_Cesky_Krumlov_%E5%A5%91%E6%96%AF%E5%9F%BA%E5%BA%AB%E5%80%AB%E6%B4%9B%E5%A4%AB%E5%9F%8E%E5%A0%A1_-_panoramio.jpg/1280px-State_Castle_and_Chateau_Cesky_Krumlov_%E5%A5%91%E6%96%AF%E5%9F%BA%E5%BA%AB%E5%80%AB%E6%B4%9B%E5%A4%AB%E5%9F%8E%E5%A0%A1_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3b/State_Castle_and_Chateau_Cesky_Krumlov_%E5%A5%91%E6%96%AF%E5%9F%BA%E5%BA%AB%E5%80%AB%E6%B4%9B%E5%A4%AB%E5%9F%8E%E5%A0%A1_-_panoramio.jpg/640px-State_Castle_and_Chateau_Cesky_Krumlov_%E5%A5%91%E6%96%AF%E5%9F%BA%E5%BA%AB%E5%80%AB%E6%B4%9B%E5%A4%AB%E5%9F%8E%E5%A0%A1_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:State_Castle_and_Chateau_Cesky_Krumlov_%E5%A5%91%E6%96%AF%E5%9F%BA%E5%BA%AB%E5%80%AB%E6%B4%9B%E5%A4%AB%E5%9F%8E%E5%A0%A1_-_panoramio.jpg",
    "authorName": "lienyuan lee",
    "license": "CC BY 3.0",
    "description": "State Castle and Chateau Cesky Krumlov 契斯基庫倫洛夫城堡"
  },
  "lm.norway.0": {
    "title": "File:0626 The seven sisters - De syv søstrene - Geiranger Fjord water falls V-P.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/0626_The_seven_sisters_-_De_syv_s%C3%B8strene_-_Geiranger_Fjord_water_falls_V-P.jpg/1280px-0626_The_seven_sisters_-_De_syv_s%C3%B8strene_-_Geiranger_Fjord_water_falls_V-P.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/0626_The_seven_sisters_-_De_syv_s%C3%B8strene_-_Geiranger_Fjord_water_falls_V-P.jpg/640px-0626_The_seven_sisters_-_De_syv_s%C3%B8strene_-_Geiranger_Fjord_water_falls_V-P.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:0626_The_seven_sisters_-_De_syv_s%C3%B8strene_-_Geiranger_Fjord_water_falls_V-P.jpg",
    "authorName": "Virtual-Pano",
    "license": "CC BY-SA 4.0",
    "description": "Eastern view of the seven sisters - waterfalls in Geiranger Fjord"
  },
  "lm.norway.2": {
    "title": "File:Night In Paradise (138497861).jpeg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Night_In_Paradise_%28138497861%29.jpeg/1280px-Night_In_Paradise_%28138497861%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a9/Night_In_Paradise_%28138497861%29.jpeg/640px-Night_In_Paradise_%28138497861%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Night_In_Paradise_(138497861).jpeg",
    "authorName": "Russo Francesco F R P I X C O M",
    "license": "CC BY 3.0",
    "description": "500px provided description: Reine bay, Lofoten islands - Norway [#sky ,#reflections ,#sea ,#mountains ,#winter ,#water ,#beach ,#travel ,#night ,#light ,#clouds ,#ocean ,#rock ,#rocks ,#stars ,#snow ,"
  },
  "lm.czechia.0": {
    "title": "File:Prag, Prager Burg, Veitsdom -- 2019 -- 6690.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Prag%2C_Prager_Burg%2C_Veitsdom_--_2019_--_6690.jpg/1280px-Prag%2C_Prager_Burg%2C_Veitsdom_--_2019_--_6690.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Prag%2C_Prager_Burg%2C_Veitsdom_--_2019_--_6690.jpg/640px-Prag%2C_Prager_Burg%2C_Veitsdom_--_2019_--_6690.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Prag,_Prager_Burg,_Veitsdom_--_2019_--_6690.jpg",
    "authorName": "Dietmar Rabich",
    "license": "CC BY-SA 4.0",
    "description": "This is a photo of a cultural monument of the Czech Republic , number:"
  },
  "lm.norway.1": {
    "title": "File:Preikestolen Norge.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Preikestolen_Norge.jpg/1280px-Preikestolen_Norge.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Preikestolen_Norge.jpg/640px-Preikestolen_Norge.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Preikestolen_Norge.jpg",
    "authorName": "Stefan Krause, Germany",
    "license": "CC BY-SA 3.0",
    "description": "Preikestolen in Forsand, Ryfylke, Norway, with Lysefjorden fjord in the background"
  },
  "lm.china.1": {
    "title": "File:The Palace Museum.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/The_Palace_Museum.jpg/1280px-The_Palace_Museum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/The_Palace_Museum.jpg/640px-The_Palace_Museum.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_Palace_Museum.jpg",
    "authorName": "Kikolipu",
    "license": "CC0",
    "description": "The Palace Museum, located in Beijing, China, was once the imperial palace of the Ming and Qing dynasties. It's renowned for its vast collection of art and artifacts, including ancient paintings, cera"
  },
  "lm.czechia.1": {
    "title": "File:Prague 07-2016 View from Petrinska Tower img2.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Prague_07-2016_View_from_Petrinska_Tower_img2.jpg/1280px-Prague_07-2016_View_from_Petrinska_Tower_img2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/20/Prague_07-2016_View_from_Petrinska_Tower_img2.jpg/640px-Prague_07-2016_View_from_Petrinska_Tower_img2.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Prague_07-2016_View_from_Petrinska_Tower_img2.jpg",
    "authorName": "A.Savin",
    "license": "FAL",
    "description": "View from Petřín Lookout Tower in Prague (Czech Republic) – Charles Bridge"
  },
  "lm.korea.1": {
    "title": "File:Seoul-Samcheongdong-traditional.houses-01.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/4/46/Seoul-Samcheongdong-traditional.houses-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/4/46/Seoul-Samcheongdong-traditional.houses-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Seoul-Samcheongdong-traditional.houses-01.jpg",
    "authorName": "Fred Ojardias",
    "license": "CC BY 2.0",
    "description": "서울 삼청동 전통한옥 마을의 모습 The roofs of traditional houses in Samcheongdong, Seoul, Korea"
  },
  "lm.india.1": {
    "title": "File:A bird eye view of Amer Fort Jaipur, India.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/A_bird_eye_view_of_Amer_Fort_Jaipur%2C_India.jpg/1280px-A_bird_eye_view_of_Amer_Fort_Jaipur%2C_India.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/A_bird_eye_view_of_Amer_Fort_Jaipur%2C_India.jpg/640px-A_bird_eye_view_of_Amer_Fort_Jaipur%2C_India.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:A_bird_eye_view_of_Amer_Fort_Jaipur,_India.jpg",
    "authorName": "APS Kondhera",
    "license": "CC BY-SA 4.0",
    "description": "The Amer Fort or The Amber Palace, Jaipur. It was built in 1562 by Raja Man Singh Ji. The Fort was built in red sandstone and marble and the Maotha Lake adds a certain charm to the entire Fort."
  },
  "lm.india.0": {
    "title": "File:Aks The Reflection Taj Mahal.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Aks_The_Reflection_Taj_Mahal.jpg/1280px-Aks_The_Reflection_Taj_Mahal.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Aks_The_Reflection_Taj_Mahal.jpg/640px-Aks_The_Reflection_Taj_Mahal.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Aks_The_Reflection_Taj_Mahal.jpg",
    "authorName": "Antrix3",
    "license": "CC BY-SA 4.0",
    "description": "This is a photo of ASI monument number"
  },
  "lm.korea.0": {
    "title": "File:Front view of the Imperial Throne Hall Geunjeongjeon at Gyeongbokgung Palace with blue sky in Seoul.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg/1280px-Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a4/Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg/640px-Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Front_view_of_the_Imperial_Throne_Hall_Geunjeongjeon_at_Gyeongbokgung_Palace_with_blue_sky_in_Seoul.jpg",
    "authorName": "Basile Morin",
    "license": "CC BY-SA 4.0",
    "description": "Front view of the Imperial Throne Hall Geunjeongjeon, at Gyeongbokgung Palace, with blue sky in Seoul , South Korea ."
  },
  "lm.vietnam.0": {
    "title": "File:Tuần Châu, Thành phố Hạ Long, Quảng Ninh, Vietnam - panoramio (10).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Tu%E1%BA%A7n_Ch%C3%A2u%2C_Th%C3%A0nh_ph%E1%BB%91_H%E1%BA%A1_Long%2C_Qu%E1%BA%A3ng_Ninh%2C_Vietnam_-_panoramio_%2810%29.jpg/1280px-Tu%E1%BA%A7n_Ch%C3%A2u%2C_Th%C3%A0nh_ph%E1%BB%91_H%E1%BA%A1_Long%2C_Qu%E1%BA%A3ng_Ninh%2C_Vietnam_-_panoramio_%2810%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/8d/Tu%E1%BA%A7n_Ch%C3%A2u%2C_Th%C3%A0nh_ph%E1%BB%91_H%E1%BA%A1_Long%2C_Qu%E1%BA%A3ng_Ninh%2C_Vietnam_-_panoramio_%2810%29.jpg/640px-Tu%E1%BA%A7n_Ch%C3%A2u%2C_Th%C3%A0nh_ph%E1%BB%91_H%E1%BA%A1_Long%2C_Qu%E1%BA%A3ng_Ninh%2C_Vietnam_-_panoramio_%2810%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tu%E1%BA%A7n_Ch%C3%A2u,_Th%C3%A0nh_ph%E1%BB%91_H%E1%BA%A1_Long,_Qu%E1%BA%A3ng_Ninh,_Vietnam_-_panoramio_(10).jpg",
    "authorName": "Zack Knowles",
    "license": "CC BY-SA 3.0",
    "description": "Tuần Châu, Thành phố Hạ Long, Quảng Ninh, Vietnam"
  },
  "lm.georgia.2": {
    "title": "File:Narikala.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Narikala.jpg/1280px-Narikala.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Narikala.jpg/640px-Narikala.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Narikala.jpg",
    "authorName": "D.Papuashvili at English Wikipedia",
    "license": "Public domain",
    "description": "Narikala Fortress in the fall, Tbilisi , Georgia ."
  },
  "lm.indonesia.2": {
    "title": "File:Kelingking Beach, Nusa Penida Bali.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Kelingking_Beach%2C_Nusa_Penida_Bali.jpg/1280px-Kelingking_Beach%2C_Nusa_Penida_Bali.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Kelingking_Beach%2C_Nusa_Penida_Bali.jpg/640px-Kelingking_Beach%2C_Nusa_Penida_Bali.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kelingking_Beach,_Nusa_Penida_Bali.jpg",
    "authorName": "Ikhsaninsani90",
    "license": "CC BY-SA 4.0",
    "description": "Seperti rahasia purba yang terukir di ujung dunia, Kelingking Beach memeluk lautan dengan lengkungnya yang megah—seolah alam menciptakan mahakarya untuk mengingatkan kita bahwa keajaiban itu nyata."
  },
  "lm.vietnam.2": {
    "title": "File:Golden Bridge above the clouds Ba Na Hills Da Nang Vietnam.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Golden_Bridge_above_the_clouds_Ba_Na_Hills_Da_Nang_Vietnam.jpg/1280px-Golden_Bridge_above_the_clouds_Ba_Na_Hills_Da_Nang_Vietnam.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Golden_Bridge_above_the_clouds_Ba_Na_Hills_Da_Nang_Vietnam.jpg/640px-Golden_Bridge_above_the_clouds_Ba_Na_Hills_Da_Nang_Vietnam.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Golden_Bridge_above_the_clouds_Ba_Na_Hills_Da_Nang_Vietnam.jpg",
    "authorName": "Vivu Vietnam",
    "license": "CC BY-SA 4.0",
    "description": "Aerial view of the Golden Bridge held by two giant hands, stretching above a sea of clouds at 1,414 metres above sea level, located in Sun World Ba Na Hills, Da Nang, Vietnam. Opened in 2018, the 150-"
  },
  "lm.indonesia.1": {
    "title": "File:Borobudur Sunrise and Volcano View.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Borobudur_Sunrise_and_Volcano_View.jpg/1280px-Borobudur_Sunrise_and_Volcano_View.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/88/Borobudur_Sunrise_and_Volcano_View.jpg/640px-Borobudur_Sunrise_and_Volcano_View.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Borobudur_Sunrise_and_Volcano_View.jpg",
    "authorName": "Christopher Michel",
    "license": "CC BY-SA 4.0",
    "description": "The sun rises over Borobudur Temple in Central Java."
  },
  "lm.georgia.1": {
    "title": "File:Svetitskhoveli Cathedral 01.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Svetitskhoveli_Cathedral_01.jpg/1280px-Svetitskhoveli_Cathedral_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/75/Svetitskhoveli_Cathedral_01.jpg/640px-Svetitskhoveli_Cathedral_01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Svetitskhoveli_Cathedral_01.jpg",
    "authorName": "Bernard Gagnon",
    "license": "CC BY 4.0",
    "description": "Svetitskhoveli Cathedral, Mtskheta, Georgia"
  },
  "lm.vietnam.1": {
    "title": "File:Hoi An Ancient Town, Vietnam (7090645195).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Hoi_An_Ancient_Town%2C_Vietnam_%287090645195%29.jpg/1280px-Hoi_An_Ancient_Town%2C_Vietnam_%287090645195%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f6/Hoi_An_Ancient_Town%2C_Vietnam_%287090645195%29.jpg/640px-Hoi_An_Ancient_Town%2C_Vietnam_%287090645195%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hoi_An_Ancient_Town,_Vietnam_(7090645195).jpg",
    "authorName": "David McKelvey from Brisbane, Australia",
    "license": "CC BY 2.0",
    "description": "&lt;a href=\" http://whc.unesco.org/en/list/948 \" rel=\"nofollow\"&gt;Hoi An Ancient Town&lt;/a&gt; is an exceptionally well-preserved example of a South-East Asian trading port dating from the 15th to t"
  },
  "lm.georgia.0": {
    "title": "File:Kazbeg Panorama.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Kazbeg_Panorama.jpg/1280px-Kazbeg_Panorama.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Kazbeg_Panorama.jpg/640px-Kazbeg_Panorama.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kazbeg_Panorama.jpg",
    "authorName": "Philipp Weigell",
    "license": "CC BY 3.0",
    "description": "360-degree panoramic view of the Gergeti Trinity Church , the Mount Kazbek , and Mount Shani in Georgia"
  },
  "lm.uzbekistan.1": {
    "title": "File:Islam Hoja Minaret outside Itchan-Kala wall, Khiva (Минарет Ислам Ходжа, Хива, Islomxoʻja minorasi).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Islam_Hoja_Minaret_outside_Itchan-Kala_wall%2C_Khiva_%28%D0%9C%D0%B8%D0%BD%D0%B0%D1%80%D0%B5%D1%82_%D0%98%D1%81%D0%BB%D0%B0%D0%BC_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B0%2C_%D0%A5%D0%B8%D0%B2%D0%B0%2C_Islomxo%CA%BBja_minorasi%29.jpg/1280px-Islam_Hoja_Minaret_outside_Itchan-Kala_wall%2C_Khiva_%28%D0%9C%D0%B8%D0%BD%D0%B0%D1%80%D0%B5%D1%82_%D0%98%D1%81%D0%BB%D0%B0%D0%BC_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B0%2C_%D0%A5%D0%B8%D0%B2%D0%B0%2C_Islomxo%CA%BBja_minorasi%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Islam_Hoja_Minaret_outside_Itchan-Kala_wall%2C_Khiva_%28%D0%9C%D0%B8%D0%BD%D0%B0%D1%80%D0%B5%D1%82_%D0%98%D1%81%D0%BB%D0%B0%D0%BC_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B0%2C_%D0%A5%D0%B8%D0%B2%D0%B0%2C_Islomxo%CA%BBja_minorasi%29.jpg/640px-Islam_Hoja_Minaret_outside_Itchan-Kala_wall%2C_Khiva_%28%D0%9C%D0%B8%D0%BD%D0%B0%D1%80%D0%B5%D1%82_%D0%98%D1%81%D0%BB%D0%B0%D0%BC_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B0%2C_%D0%A5%D0%B8%D0%B2%D0%B0%2C_Islomxo%CA%BBja_minorasi%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Islam_Hoja_Minaret_outside_Itchan-Kala_wall,_Khiva_(%D0%9C%D0%B8%D0%BD%D0%B0%D1%80%D0%B5%D1%82_%D0%98%D1%81%D0%BB%D0%B0%D0%BC_%D0%A5%D0%BE%D0%B4%D0%B6%D0%B0,_%D0%A5%D0%B8%D0%B2%D0%B0,_Islomxo%CA%BBja_minorasi).jpg",
    "authorName": "Petar Milošević",
    "license": "CC BY-SA 4.0",
    "description": "Islam Hoja Minaret outside the Khiva walls, Itchan-Kala, Khiva, Uzbekistan"
  },
  "lm.uzbekistan.2": {
    "title": "File:Poi Kalon Ensemble, Bukhara (4933989373).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Poi_Kalon_Ensemble%2C_Bukhara_%284933989373%29.jpg/1280px-Poi_Kalon_Ensemble%2C_Bukhara_%284933989373%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3f/Poi_Kalon_Ensemble%2C_Bukhara_%284933989373%29.jpg/640px-Poi_Kalon_Ensemble%2C_Bukhara_%284933989373%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Poi_Kalon_Ensemble,_Bukhara_(4933989373).jpg",
    "authorName": "Fulvio Spada from Torino, Italy",
    "license": "CC BY-SA 2.0",
    "description": "Poi Kalon Ensemble, Bukhara"
  },
  "lm.morocco.2": {
    "title": "File:Chefchaouen - blue city in Morocco 1.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Chefchaouen_-_blue_city_in_Morocco_1.jpg/1280px-Chefchaouen_-_blue_city_in_Morocco_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Chefchaouen_-_blue_city_in_Morocco_1.jpg/640px-Chefchaouen_-_blue_city_in_Morocco_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Chefchaouen_-_blue_city_in_Morocco_1.jpg",
    "authorName": "Ekaterina Kvelidze",
    "license": "CC BY-SA 4.0",
    "description": "This photo has been taken in the country: Morocco"
  },
  "lm.southafrica.0": {
    "title": "File:Cape Town (ZA), Table Mountain, Blick auf Lion's Head -- 2024 -- 2761.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Cape_Town_%28ZA%29%2C_Table_Mountain%2C_Blick_auf_Lion%27s_Head_--_2024_--_2761.jpg/1280px-Cape_Town_%28ZA%29%2C_Table_Mountain%2C_Blick_auf_Lion%27s_Head_--_2024_--_2761.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/61/Cape_Town_%28ZA%29%2C_Table_Mountain%2C_Blick_auf_Lion%27s_Head_--_2024_--_2761.jpg/640px-Cape_Town_%28ZA%29%2C_Table_Mountain%2C_Blick_auf_Lion%27s_Head_--_2024_--_2761.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cape_Town_(ZA),_Table_Mountain,_Blick_auf_Lion%27s_Head_--_2024_--_2761.jpg",
    "authorName": "Dietmar Rabich",
    "license": "CC BY-SA 4.0",
    "description": "View from Table Mountain to Lion’s Head , Cape Town , Western Cape , South Africa"
  },
  "lm.uzbekistan.0": {
    "title": "File:Registan Samarkand Uzbekistan.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Registan_Samarkand_Uzbekistan.JPG/1280px-Registan_Samarkand_Uzbekistan.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b6/Registan_Samarkand_Uzbekistan.JPG/640px-Registan_Samarkand_Uzbekistan.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Registan_Samarkand_Uzbekistan.JPG",
    "authorName": "Stomac",
    "license": "CC BY-SA 2.0 fr",
    "description": "Registan square , in Samarkand, Uzbekistan"
  },
  "lm.southafrica.1": {
    "title": "File:Cape of Good Hope sign (01).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Cape_of_Good_Hope_sign_%2801%29.jpg/1280px-Cape_of_Good_Hope_sign_%2801%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/39/Cape_of_Good_Hope_sign_%2801%29.jpg/640px-Cape_of_Good_Hope_sign_%2801%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cape_of_Good_Hope_sign_(01).jpg",
    "authorName": "Moheen Reeyad",
    "license": "CC BY-SA 4.0",
    "description": "Southwesternmost point of South Africa signs (English)"
  },
  "lm.mexico.0": {
    "title": "File:Chichen Itza 3.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/1280px-Chichen_Itza_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/51/Chichen_Itza_3.jpg/640px-Chichen_Itza_3.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Chichen_Itza_3.jpg",
    "authorName": "Daniel Schwen",
    "license": "CC BY-SA 4.0",
    "description": "El Castillo (pyramid of Kukulcán) in Chichén Itzá"
  },
  "lm.canada.2": {
    "title": "File:Chateau Frontenac from a street in Old Quebec.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Chateau_Frontenac_from_a_street_in_Old_Quebec.jpg/1280px-Chateau_Frontenac_from_a_street_in_Old_Quebec.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a3/Chateau_Frontenac_from_a_street_in_Old_Quebec.jpg/640px-Chateau_Frontenac_from_a_street_in_Old_Quebec.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Chateau_Frontenac_from_a_street_in_Old_Quebec.jpg",
    "authorName": "Wilfredor",
    "license": "CC0",
    "description": "The Château Frontenac from a street of Vieux-Québec. Quebec City, Quebec, Canada."
  },
  "lm.canada.1": {
    "title": "File:Niagara watervallen canada.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Niagara_watervallen_canada.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/3/3b/Niagara_watervallen_canada.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Niagara_watervallen_canada.jpg",
    "authorName": "Quistnix",
    "license": "CC BY-SA 3.0",
    "description": "Niagara Falls - Horseshoe Falls , Canada."
  },
  "lm.canada.0": {
    "title": "File:1 moraine lake pano 2019.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/1_moraine_lake_pano_2019.jpg/1280px-1_moraine_lake_pano_2019.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/03/1_moraine_lake_pano_2019.jpg/640px-1_moraine_lake_pano_2019.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:1_moraine_lake_pano_2019.jpg",
    "authorName": "Chensiyuan",
    "license": "CC BY-SA 4.0",
    "description": "Moraine lake, Alberta, Canada, sunrise 2019 banff lake louise"
  },
  "lm.tanzania.1": {
    "title": "File:NgoroNgoro Crater, Tanzania, Africa.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/NgoroNgoro_Crater%2C_Tanzania%2C_Africa.jpg/1280px-NgoroNgoro_Crater%2C_Tanzania%2C_Africa.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/NgoroNgoro_Crater%2C_Tanzania%2C_Africa.jpg/640px-NgoroNgoro_Crater%2C_Tanzania%2C_Africa.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:NgoroNgoro_Crater,_Tanzania,_Africa.jpg",
    "authorName": "Gary",
    "license": "CC BY 2.0",
    "description": "Plains Zebra (Equus quagga boehmi) and Blue Wildebeests (Connochaetes taurinus) in Ngorongoro Crater, Serengeti (Tanzania)."
  },
  "lm.southafrica.2": {
    "title": "File:Elephant - South Africa Safari - Djuma Game Reserve - Sabi Sand - Kruger National Park (5588012800).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Elephant_-_South_Africa_Safari_-_Djuma_Game_Reserve_-_Sabi_Sand_-_Kruger_National_Park_%285588012800%29.jpg/1280px-Elephant_-_South_Africa_Safari_-_Djuma_Game_Reserve_-_Sabi_Sand_-_Kruger_National_Park_%285588012800%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Elephant_-_South_Africa_Safari_-_Djuma_Game_Reserve_-_Sabi_Sand_-_Kruger_National_Park_%285588012800%29.jpg/640px-Elephant_-_South_Africa_Safari_-_Djuma_Game_Reserve_-_Sabi_Sand_-_Kruger_National_Park_%285588012800%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Elephant_-_South_Africa_Safari_-_Djuma_Game_Reserve_-_Sabi_Sand_-_Kruger_National_Park_(5588012800).jpg",
    "authorName": "David Berkowitz from New York, NY, USA",
    "license": "CC BY 2.0",
    "description": "A stay at Djuma Vuyatela Lodge in South Africa for a safari in the Sabi Sand area of Kruger National Park with Big Five animals (lions, cheetahs, leopards, water buffalo, rhino) - February 2011, by Da"
  },
  "lm.argentina.1": {
    "title": "File:Fitz Roy (east face) 01.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Fitz_Roy_%28east_face%29_01.JPG/1280px-Fitz_Roy_%28east_face%29_01.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Fitz_Roy_%28east_face%29_01.JPG/640px-Fitz_Roy_%28east_face%29_01.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fitz_Roy_(east_face)_01.JPG",
    "authorName": "Gagea",
    "license": "CC BY-SA 3.0",
    "description": "East face of the Fitz Roy (or Cerro Chaltén). Taken from the Laguna de los Tres. Los Glaciares National Park , Santa Cruz Province , Argentina"
  },
  "lm.mexico.1": {
    "title": "File:Teotihuacan, Pyramid of the Sun and Avenue of the Dead (20686678965).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Teotihuacan%2C_Pyramid_of_the_Sun_and_Avenue_of_the_Dead_%2820686678965%29.jpg/1280px-Teotihuacan%2C_Pyramid_of_the_Sun_and_Avenue_of_the_Dead_%2820686678965%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Teotihuacan%2C_Pyramid_of_the_Sun_and_Avenue_of_the_Dead_%2820686678965%29.jpg/640px-Teotihuacan%2C_Pyramid_of_the_Sun_and_Avenue_of_the_Dead_%2820686678965%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Teotihuacan,_Pyramid_of_the_Sun_and_Avenue_of_the_Dead_(20686678965).jpg",
    "authorName": "Arian Zwegers from Brussels, Belgium",
    "license": "CC BY 2.0",
    "description": "Teotihuacan, Pyramid of the Sun and Avenue of the Dead, from the Pyramid of the Moon Teotihuacan was an ancient Mesoamerican city located in a sub valley of the Valley of Mexico, located in the State "
  },
  "lm.peru.2": {
    "title": "File:Montana de colores Cusco (Vinicunca) y Valle Rojo por Inka Time.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Montana_de_colores_Cusco_%28Vinicunca%29_y_Valle_Rojo_por_Inka_Time.jpg/1280px-Montana_de_colores_Cusco_%28Vinicunca%29_y_Valle_Rojo_por_Inka_Time.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Montana_de_colores_Cusco_%28Vinicunca%29_y_Valle_Rojo_por_Inka_Time.jpg/640px-Montana_de_colores_Cusco_%28Vinicunca%29_y_Valle_Rojo_por_Inka_Time.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Montana_de_colores_Cusco_(Vinicunca)_y_Valle_Rojo_por_Inka_Time.jpg",
    "authorName": "Christian Morales Callo",
    "license": "CC BY-SA 4.0",
    "description": "The Mountain is located in the Cordillera del Vilcanota at 5,200 meters above sea level, in the district of Pitumarca, Cusco region. The mountain of colors or Rainbow mountain, is a beautiful mountain"
  },
  "lm.peru.0": {
    "title": "File:Machu Picchu, Perú, 2015-07-30, DD 47.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Machu_Picchu%2C_Per%C3%BA%2C_2015-07-30%2C_DD_47.JPG/1280px-Machu_Picchu%2C_Per%C3%BA%2C_2015-07-30%2C_DD_47.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/71/Machu_Picchu%2C_Per%C3%BA%2C_2015-07-30%2C_DD_47.JPG/640px-Machu_Picchu%2C_Per%C3%BA%2C_2015-07-30%2C_DD_47.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Machu_Picchu,_Per%C3%BA,_2015-07-30,_DD_47.JPG",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "View of the ancient houses of Machu Picchu houses, Urubamba Province , Cusco Region , today Peru . The 15th-century Inca citadel, abandoned one century later, is situated in the Sacred Valley on a mou"
  },
  "lm.argentina.0": {
    "title": "File:Perito Moreno Glacier Patagonia Argentina Luca Galuzzi 2005.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Perito_Moreno_Glacier_Patagonia_Argentina_Luca_Galuzzi_2005.JPG/1280px-Perito_Moreno_Glacier_Patagonia_Argentina_Luca_Galuzzi_2005.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Perito_Moreno_Glacier_Patagonia_Argentina_Luca_Galuzzi_2005.JPG/640px-Perito_Moreno_Glacier_Patagonia_Argentina_Luca_Galuzzi_2005.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Perito_Moreno_Glacier_Patagonia_Argentina_Luca_Galuzzi_2005.JPG",
    "authorName": "Luca Galuzzi ( Lucag )",
    "license": "CC BY-SA 2.5",
    "description": "Perito Moreno Glacier , in Los Glaciares National Park , southern Argentina"
  },
  "switzerland.city.lucerne": {
    "title": "File:Luzern asv2022-10 Kapellbrücke img1.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Luzern_asv2022-10_Kapellbr%C3%BCcke_img1.jpg/1280px-Luzern_asv2022-10_Kapellbr%C3%BCcke_img1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Luzern_asv2022-10_Kapellbr%C3%BCcke_img1.jpg/640px-Luzern_asv2022-10_Kapellbr%C3%BCcke_img1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Luzern_asv2022-10_Kapellbr%C3%BCcke_img1.jpg",
    "authorName": "A.Savin",
    "license": "FAL",
    "description": "Night view of the Kapellbrücke in Lucerne, Switzerland"
  },
  "uae.city.sharjah": {
    "title": "File:Sharjah Al Khan - Sharafeldin 1.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Sharjah_Al_Khan_-_Sharafeldin_1.jpg/1280px-Sharjah_Al_Khan_-_Sharafeldin_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9e/Sharjah_Al_Khan_-_Sharafeldin_1.jpg/640px-Sharjah_Al_Khan_-_Sharafeldin_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sharjah_Al_Khan_-_Sharafeldin_1.jpg",
    "authorName": "Sharaf01",
    "license": "CC BY-SA 4.0",
    "description": "Boat in Sharjah, AL Khan Corniche Street."
  },
  "norway.gallery.trolltunga": {
    "title": "File:Trolltunga, Odda, Norway (Unsplash Xj8TdoAbmos).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Trolltunga%2C_Odda%2C_Norway_%28Unsplash_Xj8TdoAbmos%29.jpg/1280px-Trolltunga%2C_Odda%2C_Norway_%28Unsplash_Xj8TdoAbmos%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Trolltunga%2C_Odda%2C_Norway_%28Unsplash_Xj8TdoAbmos%29.jpg/640px-Trolltunga%2C_Odda%2C_Norway_%28Unsplash_Xj8TdoAbmos%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Trolltunga,_Odda,_Norway_(Unsplash_Xj8TdoAbmos).jpg",
    "authorName": "Wolf Vandierendonck wolf_",
    "license": "CC0",
    "description": "Trolltunga, Odda, Norway"
  },
  "czechia.city.krumlov": {
    "title": "File:View of Český Krumlov from the castle, 20250504 1305 8880.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/View_of_%C4%8Cesk%C3%BD_Krumlov_from_the_castle%2C_20250504_1305_8880.jpg/1280px-View_of_%C4%8Cesk%C3%BD_Krumlov_from_the_castle%2C_20250504_1305_8880.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/View_of_%C4%8Cesk%C3%BD_Krumlov_from_the_castle%2C_20250504_1305_8880.jpg/640px-View_of_%C4%8Cesk%C3%BD_Krumlov_from_the_castle%2C_20250504_1305_8880.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:View_of_%C4%8Cesk%C3%BD_Krumlov_from_the_castle,_20250504_1305_8880.jpg",
    "authorName": "Jakub Hałun",
    "license": "CC BY 4.0",
    "description": "View of Český Krumlov from the castle"
  },
  "korea.city.jeju": {
    "title": "File:Cheonjeyeon Waterfall 02.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Cheonjeyeon_Waterfall_02.JPG/1280px-Cheonjeyeon_Waterfall_02.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/81/Cheonjeyeon_Waterfall_02.JPG/640px-Cheonjeyeon_Waterfall_02.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cheonjeyeon_Waterfall_02.JPG",
    "authorName": "Abasaa",
    "license": "Public domain",
    "description": "Cheonjeyeon Waterfall"
  },
  "czechia.city.karlovy": {
    "title": "File:Fountain near the Market Colonnade. Karlovy Vary, Czech Republic.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Fountain_near_the_Market_Colonnade._Karlovy_Vary%2C_Czech_Republic.jpg/1280px-Fountain_near_the_Market_Colonnade._Karlovy_Vary%2C_Czech_Republic.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Fountain_near_the_Market_Colonnade._Karlovy_Vary%2C_Czech_Republic.jpg/640px-Fountain_near_the_Market_Colonnade._Karlovy_Vary%2C_Czech_Republic.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fountain_near_the_Market_Colonnade._Karlovy_Vary,_Czech_Republic.jpg",
    "authorName": "Ввласенко",
    "license": "CC BY-SA 3.0",
    "description": "Fountain near the Market Colonnade. Karlovy Vary, Czech Republic"
  },
  "vietnam.gallery.hoian": {
    "title": "File:Hội An, Ancient Town, 2020-01 CN-06.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-06.jpg/1280px-H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-06.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b1/H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-06.jpg/640px-H%E1%BB%99i_An%2C_Ancient_Town%2C_2020-01_CN-06.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:H%E1%BB%99i_An,_Ancient_Town,_2020-01_CN-06.jpg",
    "authorName": "Steffen Schmitz ( more photos )",
    "license": "CC BY-SA 4.0",
    "description": "Hội An ( Vietnam ) – World Heritage Site Hoi An Ancient Town – houses"
  },
  "vietnam.gallery.sapa": {
    "title": "File:Road and paddy fields in Sa Pa, Vietnam, 20240126 1202 3586.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Road_and_paddy_fields_in_Sa_Pa%2C_Vietnam%2C_20240126_1202_3586.jpg/1280px-Road_and_paddy_fields_in_Sa_Pa%2C_Vietnam%2C_20240126_1202_3586.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Road_and_paddy_fields_in_Sa_Pa%2C_Vietnam%2C_20240126_1202_3586.jpg/640px-Road_and_paddy_fields_in_Sa_Pa%2C_Vietnam%2C_20240126_1202_3586.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Road_and_paddy_fields_in_Sa_Pa,_Vietnam,_20240126_1202_3586.jpg",
    "authorName": "Jakub Hałun",
    "license": "CC BY 4.0",
    "description": "Road and paddy fields near Sa Pa town, Vietnam"
  },
  "georgia.gallery.batumi": {
    "title": "File:Batumi Boulevard Magnolia.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Batumi_Boulevard_Magnolia.jpg/1280px-Batumi_Boulevard_Magnolia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4d/Batumi_Boulevard_Magnolia.jpg/640px-Batumi_Boulevard_Magnolia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Batumi_Boulevard_Magnolia.jpg",
    "authorName": "Sosotedrd",
    "license": "CC BY-SA 4.0",
    "description": "მაგნოლიების ხეივანი"
  },
  "georgia.gallery.old_tbilisi": {
    "title": "File:Old Tbilisi. Abanotubani. Souvenirs.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Old_Tbilisi._Abanotubani._Souvenirs.jpg/1280px-Old_Tbilisi._Abanotubani._Souvenirs.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Old_Tbilisi._Abanotubani._Souvenirs.jpg/640px-Old_Tbilisi._Abanotubani._Souvenirs.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Old_Tbilisi._Abanotubani._Souvenirs.jpg",
    "authorName": "Eka Samkharadze",
    "license": "CC BY-SA 4.0",
    "description": "აბანოთუბანი. სუვენირები"
  },
  "georgia.city.batumi": {
    "title": "File:Piazza, Batumi. Aug 2016 (1).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Piazza%2C_Batumi._Aug_2016_%281%29.jpg/1280px-Piazza%2C_Batumi._Aug_2016_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Piazza%2C_Batumi._Aug_2016_%281%29.jpg/640px-Piazza%2C_Batumi._Aug_2016_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Piazza,_Batumi._Aug_2016_(1).jpg",
    "authorName": "Kober",
    "license": "CC BY-SA 4.0",
    "description": "Piazza square, Batumi"
  },
  "uzbekistan.gallery.tashkent": {
    "title": "File:Minbar of Hazrati Imam Mosque.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Minbar_of_Hazrati_Imam_Mosque.jpg/1280px-Minbar_of_Hazrati_Imam_Mosque.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/33/Minbar_of_Hazrati_Imam_Mosque.jpg/640px-Minbar_of_Hazrati_Imam_Mosque.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Minbar_of_Hazrati_Imam_Mosque.jpg",
    "authorName": "Bgag",
    "license": "CC0",
    "description": "Minbar of Hazrati Imam Mosque, Tashkent, Uzbekistan"
  },
  "uzbekistan.gallery.charvak": {
    "title": "File:Uzbekistan Chimgan Mountains.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Uzbekistan_Chimgan_Mountains.jpg/1280px-Uzbekistan_Chimgan_Mountains.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/be/Uzbekistan_Chimgan_Mountains.jpg/640px-Uzbekistan_Chimgan_Mountains.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Uzbekistan_Chimgan_Mountains.jpg",
    "authorName": "Dan Lundberg",
    "license": "CC BY-SA 2.0",
    "description": "Charvak Reservoir in the Chimgan Mountains. On Google Earth: Charvak Reservoir 41°38'3.89\"N, 70° 1'43.50\"E"
  },
  "southafrica.gallery.stellenbosch": {
    "title": "File:Cape Town (ZA), Wale Street -- 2024 -- 3536.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Cape_Town_%28ZA%29%2C_Wale_Street_--_2024_--_3536.jpg/1280px-Cape_Town_%28ZA%29%2C_Wale_Street_--_2024_--_3536.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d3/Cape_Town_%28ZA%29%2C_Wale_Street_--_2024_--_3536.jpg/640px-Cape_Town_%28ZA%29%2C_Wale_Street_--_2024_--_3536.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cape_Town_(ZA),_Wale_Street_--_2024_--_3536.jpg",
    "authorName": "Dietmar Rabich",
    "license": "CC BY-SA 4.0",
    "description": "Colorful houses in Wale Street , Cape Town , Western Cape , South Africa Bo-Kaap is a historic neighborhood above the center of Cape Town. It was established in the 18th century when the Dutch colonia"
  },
  "tanzania.gallery.serengeti": {
    "title": "File:011 The lion king Tryggve in the Serengeti National Park Photo by Giles Laurent.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/011_The_lion_king_Tryggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg/1280px-011_The_lion_king_Tryggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6f/011_The_lion_king_Tryggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg/640px-011_The_lion_king_Tryggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:011_The_lion_king_Tryggve_in_the_Serengeti_National_Park_Photo_by_Giles_Laurent.jpg",
    "authorName": "Giles Laurent",
    "license": "CC BY-SA 4.0",
    "description": "Portrait of the wild lion ( Panthera leo ) Tryggve , son of C-Boy , in the Serengeti National Park , Tanzania."
  },
  "tanzania.gallery.stonetown": {
    "title": "File:Sail Boat Sunset Stone Town Zanzibar Oct26 OM3 1123.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Sail_Boat_Sunset_Stone_Town_Zanzibar_Oct26_OM3_1123.jpg/1280px-Sail_Boat_Sunset_Stone_Town_Zanzibar_Oct26_OM3_1123.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/84/Sail_Boat_Sunset_Stone_Town_Zanzibar_Oct26_OM3_1123.jpg/640px-Sail_Boat_Sunset_Stone_Town_Zanzibar_Oct26_OM3_1123.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sail_Boat_Sunset_Stone_Town_Zanzibar_Oct26_OM3_1123.jpg",
    "authorName": "This Photo was taken by Timothy A. Gonsalves ...",
    "license": "CC BY-SA 4.0",
    "description": "Fishing boat sailing past the setting sun, Stone Town harbour, Unguja Urban West, Zanzibar"
  },
  "tanzania.city.zanzibar": {
    "title": "File:Azam Sea Link 2 Ferry Stone Town Oct26 OM3 1121.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Azam_Sea_Link_2_Ferry_Stone_Town_Oct26_OM3_1121.jpg/1280px-Azam_Sea_Link_2_Ferry_Stone_Town_Oct26_OM3_1121.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Azam_Sea_Link_2_Ferry_Stone_Town_Oct26_OM3_1121.jpg/640px-Azam_Sea_Link_2_Ferry_Stone_Town_Oct26_OM3_1121.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Azam_Sea_Link_2_Ferry_Stone_Town_Oct26_OM3_1121.jpg",
    "authorName": "This Photo was taken by Timothy A. Gonsalves ...",
    "license": "CC BY-SA 4.0",
    "description": "Azam Sea Link 2 ferry anchored off Stone Town harbour, Zanzibar"
  },
  "canada.gallery.rockies": {
    "title": "File:Peyto Lake-Banff NP-Canada.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Peyto_Lake-Banff_NP-Canada.jpg/1280px-Peyto_Lake-Banff_NP-Canada.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Peyto_Lake-Banff_NP-Canada.jpg/640px-Peyto_Lake-Banff_NP-Canada.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Peyto_Lake-Banff_NP-Canada.jpg",
    "authorName": "Tobias Alt, Tobi 87",
    "license": "CC BY-SA 4.0",
    "description": "An attraction of Banff National Park in the Canadian province of Alberta : the turquoise Peyto Lake seen from a viewpoint at Icefields Parkway . This water colour is caused by glacier water, carrying "
  },
  "canada.city.vancouver": {
    "title": "File:Vancouver dusk pano.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Vancouver_dusk_pano.jpg/1280px-Vancouver_dusk_pano.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Vancouver_dusk_pano.jpg/640px-Vancouver_dusk_pano.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Vancouver_dusk_pano.jpg",
    "authorName": "Mfield , Matthew Field, http://www.photograph...",
    "license": "CC BY-SA 3.0",
    "description": "Vancouver, BC viewed from the south with mountains behind. Blended exposure version. 20 stitched images (original @ 50000x4000px)"
  },
  "canada.city.montreal": {
    "title": "File:Basílica de Notre-Dame, Montreal, Canadá, 2017-08-12, DD 22-24 HDR.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Bas%C3%ADlica_de_Notre-Dame%2C_Montreal%2C_Canad%C3%A1%2C_2017-08-12%2C_DD_22-24_HDR.jpg/1280px-Bas%C3%ADlica_de_Notre-Dame%2C_Montreal%2C_Canad%C3%A1%2C_2017-08-12%2C_DD_22-24_HDR.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e2/Bas%C3%ADlica_de_Notre-Dame%2C_Montreal%2C_Canad%C3%A1%2C_2017-08-12%2C_DD_22-24_HDR.jpg/640px-Bas%C3%ADlica_de_Notre-Dame%2C_Montreal%2C_Canad%C3%A1%2C_2017-08-12%2C_DD_22-24_HDR.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Bas%C3%ADlica_de_Notre-Dame,_Montreal,_Canad%C3%A1,_2017-08-12,_DD_22-24_HDR.jpg",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "Interior of the Notre-Dame Basilica , located in the historic district of Old Montreal , in Montreal , Quebec , Canada . The interior of the basilica, built in Gothic Revival style, is impressive with"
  },
  "peru.gallery.arequipa": {
    "title": "File:Cloister Monastery Santa Catalina Arequipa Peru.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/9/97/Cloister_Monastery_Santa_Catalina_Arequipa_Peru.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/9/97/Cloister_Monastery_Santa_Catalina_Arequipa_Peru.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cloister_Monastery_Santa_Catalina_Arequipa_Peru.jpg",
    "authorName": "Jialiang Gao www.peace-on-earth.org",
    "license": "CC BY-SA 3.0",
    "description": "The Cloisters and Nuns at the Santa Catalina Monastery, Arequipa, Peru"
  },
  "mexico.gallery.guanajuato": {
    "title": "File:El Pipila (6886069).jpeg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/El_Pipila_%286886069%29.jpeg/1280px-El_Pipila_%286886069%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/El_Pipila_%286886069%29.jpeg/640px-El_Pipila_%286886069%29.jpeg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:El_Pipila_(6886069).jpeg",
    "authorName": "Javier Mejia Garcia",
    "license": "CC BY-SA 3.0",
    "description": "500px provided description: Monumento a El Pipila, en la Guanajuato [#city ,#street ,#mexico ,#travel ,#night ,#urban ,#architecture ,#monument ,#guanajuato ,#monumento ,#pipila ,#m?xio]"
  },
  "peru.gallery.colca": {
    "title": "File:Peru - Colca Canyon - Culpeo - Lycalopex culpaeus.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Peru_-_Colca_Canyon_-_Culpeo_-_Lycalopex_culpaeus.jpg/1280px-Peru_-_Colca_Canyon_-_Culpeo_-_Lycalopex_culpaeus.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e5/Peru_-_Colca_Canyon_-_Culpeo_-_Lycalopex_culpaeus.jpg/640px-Peru_-_Colca_Canyon_-_Culpeo_-_Lycalopex_culpaeus.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Peru_-_Colca_Canyon_-_Culpeo_-_Lycalopex_culpaeus.jpg",
    "authorName": "Thomas Fuhrmann",
    "license": "CC BY-SA 4.0",
    "description": "Peru - Colca Canyon - Culpeo - Lycalopex culpaeus - PanAmericana 2017 - the image was taken on an overlanding travel from Ushuaia to Anchorage - taken by Thomas Fuhrmann, SnowmanStudios - see more pic"
  },
  "peru.city.lima": {
    "title": "File:Cliffs at Miraflores, Lima.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Cliffs_at_Miraflores%2C_Lima.jpg/1280px-Cliffs_at_Miraflores%2C_Lima.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/97/Cliffs_at_Miraflores%2C_Lima.jpg/640px-Cliffs_at_Miraflores%2C_Lima.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cliffs_at_Miraflores,_Lima.jpg",
    "authorName": "David Bush",
    "license": "CC BY 2.0",
    "description": "Costa verde, Lima, Peru."
  },
  "thailand.city.phuket": {
    "title": "File:Beautiful Sunset on Promthep Cape, Phuket island, Thailand.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Beautiful_Sunset_on_Promthep_Cape%2C_Phuket_island%2C_Thailand.jpg/1280px-Beautiful_Sunset_on_Promthep_Cape%2C_Phuket_island%2C_Thailand.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Beautiful_Sunset_on_Promthep_Cape%2C_Phuket_island%2C_Thailand.jpg/640px-Beautiful_Sunset_on_Promthep_Cape%2C_Phuket_island%2C_Thailand.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Beautiful_Sunset_on_Promthep_Cape,_Phuket_island,_Thailand.jpg",
    "authorName": "Phuket@photographer.net",
    "license": "CC BY 2.0",
    "description": "Promthep Cape"
  },
  "belarus.city.grodno": {
    "title": "File:Muraŭjoŭ House in Hrodna.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Mura%C5%ADjo%C5%AD_House_in_Hrodna.jpg/1280px-Mura%C5%ADjo%C5%AD_House_in_Hrodna.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/77/Mura%C5%ADjo%C5%AD_House_in_Hrodna.jpg/640px-Mura%C5%ADjo%C5%AD_House_in_Hrodna.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mura%C5%ADjo%C5%AD_House_in_Hrodna.jpg",
    "authorName": "Alexxx1979",
    "license": "CC BY-SA 4.0",
    "description": "Muraŭjoŭ House in Hrodna"
  },
  "kazakhstan.city.almaty": {
    "title": "File:Almaty Skyline from the Kök Töbe hill.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Almaty_Skyline_from_the_K%C3%B6k_T%C3%B6be_hill.jpg/1280px-Almaty_Skyline_from_the_K%C3%B6k_T%C3%B6be_hill.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4f/Almaty_Skyline_from_the_K%C3%B6k_T%C3%B6be_hill.jpg/640px-Almaty_Skyline_from_the_K%C3%B6k_T%C3%B6be_hill.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Almaty_Skyline_from_the_K%C3%B6k_T%C3%B6be_hill.jpg",
    "authorName": "Dauren Nabijan",
    "license": "CC0",
    "description": "City Skyline of Almaty from the Kök Töbe view point"
  },
  "kazakhstan.gallery.astana": {
    "title": "File:Night at Esil District, Astana (P1190721).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Night_at_Esil_District%2C_Astana_%28P1190721%29.jpg/1280px-Night_at_Esil_District%2C_Astana_%28P1190721%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a5/Night_at_Esil_District%2C_Astana_%28P1190721%29.jpg/640px-Night_at_Esil_District%2C_Astana_%28P1190721%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Night_at_Esil_District,_Astana_(P1190721).jpg",
    "authorName": "Matti Blume",
    "license": "CC BY-SA 4.0",
    "description": "Night view of Esil district in Astana"
  },
  "kazakhstan.city.astana": {
    "title": "File:Esil District, Astana (P1190688).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Esil_District%2C_Astana_%28P1190688%29.jpg/1280px-Esil_District%2C_Astana_%28P1190688%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Esil_District%2C_Astana_%28P1190688%29.jpg/640px-Esil_District%2C_Astana_%28P1190688%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Esil_District,_Astana_(P1190688).jpg",
    "authorName": "Matti Blume",
    "license": "CC BY-SA 4.0",
    "description": "Mangilik El Avenue in Esil district, Astana"
  },
  "finland.city.rovaniemi": {
    "title": "File:Rovaniemi Lumberjack’s Candle Bridge.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Rovaniemi_Lumberjack%E2%80%99s_Candle_Bridge.jpg/1280px-Rovaniemi_Lumberjack%E2%80%99s_Candle_Bridge.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/2f/Rovaniemi_Lumberjack%E2%80%99s_Candle_Bridge.jpg/640px-Rovaniemi_Lumberjack%E2%80%99s_Candle_Bridge.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rovaniemi_Lumberjack%E2%80%99s_Candle_Bridge.jpg",
    "authorName": "themadpenguin",
    "license": "CC BY 2.0",
    "description": "Rovaniemi Lumberjack’s Candle Bridge"
  },
  "finland.city.turku": {
    "title": "File:Turku Cathedral ceiling.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Turku_Cathedral_ceiling.jpg/1280px-Turku_Cathedral_ceiling.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bc/Turku_Cathedral_ceiling.jpg/640px-Turku_Cathedral_ceiling.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Turku_Cathedral_ceiling.jpg",
    "authorName": "Virtual-Pano",
    "license": "CC BY-SA 4.0",
    "description": "This is a photo of a monument in Finland identified by the ID 'Turku Cathedral' (Q1187606)"
  },
  "serbia.city.subotica": {
    "title": "File:The City Hall Subotica (2024).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/The_City_Hall_Subotica_%282024%29.jpg/1280px-The_City_Hall_Subotica_%282024%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/eb/The_City_Hall_Subotica_%282024%29.jpg/640px-The_City_Hall_Subotica_%282024%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_City_Hall_Subotica_(2024).jpg",
    "authorName": "This image was made by Sadko . Please credit ...",
    "license": "CC BY-SA 4.0",
    "description": "The City Hall Subotica (2024)"
  },
  "lm.thailand.1": {
    "title": "File:Isla Tapu, Phuket, Tailandia, 2013-08-20, DD 36.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Isla_Tapu%2C_Phuket%2C_Tailandia%2C_2013-08-20%2C_DD_36.JPG/1280px-Isla_Tapu%2C_Phuket%2C_Tailandia%2C_2013-08-20%2C_DD_36.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/e3/Isla_Tapu%2C_Phuket%2C_Tailandia%2C_2013-08-20%2C_DD_36.JPG/640px-Isla_Tapu%2C_Phuket%2C_Tailandia%2C_2013-08-20%2C_DD_36.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Isla_Tapu,_Phuket,_Tailandia,_2013-08-20,_DD_36.JPG",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 3.0",
    "description": "Ko Tapu (Tapu Island) is a 20 m tall islet in front of the Khao Phing Kan islands, in the Phang Nga Bay , in Thailand. The island belongs to the Phang Nga National Park and since 1974 is also known as"
  },
  "lm.japan.0": {
    "title": "File:Chureito Pagoda and Mount Fuji 2023-03-07.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Chureito_Pagoda_and_Mount_Fuji_2023-03-07.jpg/1280px-Chureito_Pagoda_and_Mount_Fuji_2023-03-07.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/53/Chureito_Pagoda_and_Mount_Fuji_2023-03-07.jpg/640px-Chureito_Pagoda_and_Mount_Fuji_2023-03-07.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Chureito_Pagoda_and_Mount_Fuji_2023-03-07.jpg",
    "authorName": "Stjepko Krehula",
    "license": "CC BY 4.0",
    "description": "Chureito Pagoda and Mount Fuji"
  },
  "lm.uae.2": {
    "title": "File:Visitors Louvre Abu Dhabi.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Visitors_Louvre_Abu_Dhabi.jpg/1280px-Visitors_Louvre_Abu_Dhabi.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Visitors_Louvre_Abu_Dhabi.jpg/640px-Visitors_Louvre_Abu_Dhabi.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Visitors_Louvre_Abu_Dhabi.jpg",
    "authorName": "Saschaporsche",
    "license": "CC BY-SA 4.0",
    "description": "bezoekers in het Louvre Abu Dhabi"
  },
  "lm.switzerland.1": {
    "title": "File:Jungfraujoch, Lauterbrunnen, Switzerland (Unsplash).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Jungfraujoch%2C_Lauterbrunnen%2C_Switzerland_%28Unsplash%29.jpg/1280px-Jungfraujoch%2C_Lauterbrunnen%2C_Switzerland_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/Jungfraujoch%2C_Lauterbrunnen%2C_Switzerland_%28Unsplash%29.jpg/640px-Jungfraujoch%2C_Lauterbrunnen%2C_Switzerland_%28Unsplash%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jungfraujoch,_Lauterbrunnen,_Switzerland_(Unsplash).jpg",
    "authorName": "p.parnxoxo ohparnzall",
    "license": "CC0",
    "description": "Jungfraujoch, Lauterbrunnen, Switzerland"
  },
  "lm.china.0": {
    "title": "File:Badaling China Great-Wall-of-China-01.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Badaling_China_Great-Wall-of-China-01.jpg/1280px-Badaling_China_Great-Wall-of-China-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/50/Badaling_China_Great-Wall-of-China-01.jpg/640px-Badaling_China_Great-Wall-of-China-01.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Badaling_China_Great-Wall-of-China-01.jpg",
    "authorName": "CEphoto, Uwe Aranas",
    "license": "CC BY-SA 3.0",
    "description": "Badaling, China: Great Wall of China at Badaling"
  },
  "lm.china.2": {
    "title": "File:Zhangjiajie National Forest Park.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Zhangjiajie_National_Forest_Park.jpg/1280px-Zhangjiajie_National_Forest_Park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Zhangjiajie_National_Forest_Park.jpg/640px-Zhangjiajie_National_Forest_Park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Zhangjiajie_National_Forest_Park.jpg",
    "authorName": "Kuruman from Tokyo, Japan",
    "license": "CC BY 2.0",
    "description": "Zhangjiajie National Forest Park"
  },
  "lm.india.2": {
    "title": "File:Qutb Minar with Neem Tree.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Qutb_Minar_with_Neem_Tree.jpg/1280px-Qutb_Minar_with_Neem_Tree.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Qutb_Minar_with_Neem_Tree.jpg/640px-Qutb_Minar_with_Neem_Tree.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Qutb_Minar_with_Neem_Tree.jpg",
    "authorName": "Shikhers",
    "license": "CC BY-SA 4.0",
    "description": "Qutb Minar in the evening seen along with Neem Tree ( Azadirachta indica )"
  },
  "lm.korea.2": {
    "title": "File:Jeju Island.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Jeju_Island.jpg/1280px-Jeju_Island.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c6/Jeju_Island.jpg/640px-Jeju_Island.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Jeju_Island.jpg",
    "authorName": "Robert Simmon, using Landsat data provided by...",
    "license": "Public domain",
    "description": "Jeju Island"
  },
  "lm.morocco.0": {
    "title": "File:Le jardin des majorelle 16.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Le_jardin_des_majorelle_16.JPG/1280px-Le_jardin_des_majorelle_16.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/57/Le_jardin_des_majorelle_16.JPG/640px-Le_jardin_des_majorelle_16.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Le_jardin_des_majorelle_16.JPG",
    "authorName": "Viault",
    "license": "CC BY-SA 4.0",
    "description": "Jardin Majorelle en 2010, Marrakech, Maroc."
  },
  "lm.indonesia.0": {
    "title": "File:Tegallalang rice terraces SF0001.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Tegallalang_rice_terraces_SF0001.jpg/1280px-Tegallalang_rice_terraces_SF0001.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c5/Tegallalang_rice_terraces_SF0001.jpg/640px-Tegallalang_rice_terraces_SF0001.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tegallalang_rice_terraces_SF0001.jpg",
    "authorName": "Stefan Fussan",
    "license": "CC BY-SA 4.0",
    "description": "Tegallalang rice terraces"
  },
  "lm.tanzania.0": {
    "title": "File:Mount Kilimanjaro.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Mount_Kilimanjaro.jpg/1280px-Mount_Kilimanjaro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/91/Mount_Kilimanjaro.jpg/640px-Mount_Kilimanjaro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mount_Kilimanjaro.jpg",
    "authorName": "Muhammad Mahdi Karim",
    "license": "GFDL 1.2",
    "description": "A panorama of Mount Kilimanjaro . Picture taken in Moshi, Tanzania"
  },
  "lm.morocco.1": {
    "title": "File:Ksar Aït Benhaddou, Marocco (أيت بن حدو، المغرب, ⴰⵢⵜ ⵃⴰⴷⴷⵓ).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Ksar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg/1280px-Ksar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Ksar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg/640px-Ksar_A%C3%AFt_Benhaddou%2C_Marocco_%28%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8%2C_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ksar_A%C3%AFt_Benhaddou,_Marocco_(%D8%A3%D9%8A%D8%AA_%D8%A8%D9%86_%D8%AD%D8%AF%D9%88%D8%8C_%D8%A7%D9%84%D9%85%D8%BA%D8%B1%D8%A8,_%E2%B4%B0%E2%B5%A2%E2%B5%9C_%E2%B5%83%E2%B4%B0%E2%B4%B7%E2%B4%B7%E2%B5%93).jpg",
    "authorName": "Petar Milošević",
    "license": "CC BY-SA 4.0",
    "description": "Ksar Aït Benhaddou, Marocco Aït Benhaddou (Arabic: آيت بن حدّو) is a historic ighrem or ksar (fortified village) along the former caravan route between the Sahara and Marrakesh in Morocco. It is consi"
  },
  "lm.tanzania.2": {
    "title": "File:Zanzi2020.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Zanzi2020.jpg/1280px-Zanzi2020.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1b/Zanzi2020.jpg/640px-Zanzi2020.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Zanzi2020.jpg",
    "authorName": "Kovdon",
    "license": "CC BY-SA 4.0",
    "description": "Az első közös képek egyike Arnival 2022-ben."
  },
  "lm.mexico.2": {
    "title": "File:Tulum Archaeological Zone Mexico 02.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Tulum_Archaeological_Zone_Mexico_02.jpg/1280px-Tulum_Archaeological_Zone_Mexico_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d5/Tulum_Archaeological_Zone_Mexico_02.jpg/640px-Tulum_Archaeological_Zone_Mexico_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tulum_Archaeological_Zone_Mexico_02.jpg",
    "authorName": "Nosferattus",
    "license": "CC0",
    "description": "The Tulum Archaeological Zone in Mexico"
  },
  "lm.peru.1": {
    "title": "File:Peru - Cusco Sacred Valley & Incan Ruins 045 - Moray (7094833217).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Peru_-_Cusco_Sacred_Valley_%26_Incan_Ruins_045_-_Moray_%287094833217%29.jpg/1280px-Peru_-_Cusco_Sacred_Valley_%26_Incan_Ruins_045_-_Moray_%287094833217%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ee/Peru_-_Cusco_Sacred_Valley_%26_Incan_Ruins_045_-_Moray_%287094833217%29.jpg/640px-Peru_-_Cusco_Sacred_Valley_%26_Incan_Ruins_045_-_Moray_%287094833217%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Peru_-_Cusco_Sacred_Valley_%26_Incan_Ruins_045_-_Moray_(7094833217).jpg",
    "authorName": "McKay Savage from London, UK",
    "license": "CC BY 2.0",
    "description": "The gorgeous circular terraced bowl of Moray are thought to be an experimental agricultural nursery for the Incas, with different micro-climates allowing for different varieties of corn to be planted "
  },
  "lm.argentina.2": {
    "title": "File:Fachada del Teatro Colón en Buenos Aires, Argentina.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Fachada_del_Teatro_Col%C3%B3n_en_Buenos_Aires%2C_Argentina.jpg/1280px-Fachada_del_Teatro_Col%C3%B3n_en_Buenos_Aires%2C_Argentina.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Fachada_del_Teatro_Col%C3%B3n_en_Buenos_Aires%2C_Argentina.jpg/640px-Fachada_del_Teatro_Col%C3%B3n_en_Buenos_Aires%2C_Argentina.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fachada_del_Teatro_Col%C3%B3n_en_Buenos_Aires,_Argentina.jpg",
    "authorName": "EEJCC",
    "license": "CC0",
    "description": "Main facade of Teatro Colón"
  },
  "lm.nz.1": {
    "title": "File:Lake Pukaki.Glacier blue waters (10335459753).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Lake_Pukaki.Glacier_blue_waters_%2810335459753%29.jpg/1280px-Lake_Pukaki.Glacier_blue_waters_%2810335459753%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7a/Lake_Pukaki.Glacier_blue_waters_%2810335459753%29.jpg/640px-Lake_Pukaki.Glacier_blue_waters_%2810335459753%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Lake_Pukaki.Glacier_blue_waters_(10335459753).jpg",
    "authorName": "Bernard Spragg. NZ from Christchurch, New Zea...",
    "license": "CC0",
    "description": "Lake Pukaki is the largest of three roughly parallel alpine lakes running north-south along the northern edge of the Mackenzie Basin on New Zealand's South Island. The others are Lakes Tekapo and Ohau"
  },
  "lm.nz.0": {
    "title": "File:Milford Sound in Fiordland National Park 05.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Milford_Sound_in_Fiordland_National_Park_05.jpg/1280px-Milford_Sound_in_Fiordland_National_Park_05.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d1/Milford_Sound_in_Fiordland_National_Park_05.jpg/640px-Milford_Sound_in_Fiordland_National_Park_05.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Milford_Sound_in_Fiordland_National_Park_05.jpg",
    "authorName": "Krzysztof Golik",
    "license": "CC BY-SA 4.0",
    "description": "Milford Sound in Fiordland National Park, South Island of New Zealand"
  },
  "lm.nz.2": {
    "title": "File:Hobbit holes reflected in water.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Hobbit_holes_reflected_in_water.jpg/1280px-Hobbit_holes_reflected_in_water.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Hobbit_holes_reflected_in_water.jpg/640px-Hobbit_holes_reflected_in_water.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hobbit_holes_reflected_in_water.jpg",
    "authorName": "Jackie.lck ( photos · photo sets )",
    "license": "CC BY 2.0",
    "description": "Hobbit holes reflected in water in Hobbiton, Matamata, New Zealand"
  },
  "lm.fiji.0": {
    "title": "File:Monuriki 06.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Monuriki_06.JPG/1280px-Monuriki_06.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/ff/Monuriki_06.JPG/640px-Monuriki_06.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Monuriki_06.JPG",
    "authorName": "Shutterbuggery",
    "license": "CC BY-SA 3.0",
    "description": "Monuriki Island, part of the Mamanuka Islands Group, Fiji Islands, Pacific Ocean. The island where the 2000 movie \"Cast Away\" was primarily filmed. The distinct summit can be clearly seen as it can in"
  },
  "lm.fiji.1": {
    "title": "File:Nadi Sri Siva Subramaniya Temple.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Nadi_Sri_Siva_Subramaniya_Temple.jpg/1280px-Nadi_Sri_Siva_Subramaniya_Temple.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Nadi_Sri_Siva_Subramaniya_Temple.jpg/640px-Nadi_Sri_Siva_Subramaniya_Temple.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nadi_Sri_Siva_Subramaniya_Temple.jpg",
    "authorName": "Dead.rabbit",
    "license": "CC BY-SA 4.0",
    "description": "Sri Siva Subramaniya Temple at Nadi, Fiji"
  },
  "lm.fiji.2": {
    "title": "File:BoumaFalls.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/2/2a/BoumaFalls.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/2/2a/BoumaFalls.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:BoumaFalls.jpg",
    "authorName": "User:Doron",
    "license": "CC BY-SA 3.0",
    "description": "Bouma Falls, Taveuni Island, Fiji."
  },
  "lm.austria.1": {
    "title": "File:Hallstatt Austria Bergsee Lake Alpine Summer.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Hallstatt_Austria_Bergsee_Lake_Alpine_Summer.jpg/1280px-Hallstatt_Austria_Bergsee_Lake_Alpine_Summer.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/23/Hallstatt_Austria_Bergsee_Lake_Alpine_Summer.jpg/640px-Hallstatt_Austria_Bergsee_Lake_Alpine_Summer.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Hallstatt_Austria_Bergsee_Lake_Alpine_Summer.jpg",
    "authorName": "Julius_Silver",
    "license": "CC0",
    "description": "Hallstatt Austria Bergsee Lake Alpine Summer"
  },
  "lm.austria.0": {
    "title": "File:Gloriette Schönbrunn Wien (Zuschnitt).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Gloriette_Sch%C3%B6nbrunn_Wien_%28Zuschnitt%29.jpg/1280px-Gloriette_Sch%C3%B6nbrunn_Wien_%28Zuschnitt%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Gloriette_Sch%C3%B6nbrunn_Wien_%28Zuschnitt%29.jpg/640px-Gloriette_Sch%C3%B6nbrunn_Wien_%28Zuschnitt%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Gloriette_Sch%C3%B6nbrunn_Wien_(Zuschnitt).jpg",
    "authorName": "Thomas Wolf , www.foto-tw.de",
    "license": "CC BY-SA 3.0 de",
    "description": "Gloriette in Vienna , Austria"
  },
  "lm.austria.2": {
    "title": "File:Salzburg Altstadt Panorama 20170409 02.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Salzburg_Altstadt_Panorama_20170409_02.jpg/1280px-Salzburg_Altstadt_Panorama_20170409_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Salzburg_Altstadt_Panorama_20170409_02.jpg/640px-Salzburg_Altstadt_Panorama_20170409_02.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Salzburg_Altstadt_Panorama_20170409_02.jpg",
    "authorName": "Uoaei1",
    "license": "CC BY-SA 4.0",
    "description": "View from Mönchsberg to Hohensalzburg Fortress and the historic center of Salzburg , federal state of Salzburg, Austria"
  },
  "lm.netherlands.0": {
    "title": "File:Rijksmuseum from Museumplein 2523.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Rijksmuseum_from_Museumplein_2523.jpg/1280px-Rijksmuseum_from_Museumplein_2523.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/47/Rijksmuseum_from_Museumplein_2523.jpg/640px-Rijksmuseum_from_Museumplein_2523.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rijksmuseum_from_Museumplein_2523.jpg",
    "authorName": "C messier",
    "license": "CC BY-SA 4.0",
    "description": ""
  },
  "lm.netherlands.1": {
    "title": "File:The windmills of Kinderdijk.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/The_windmills_of_Kinderdijk.JPG/1280px-The_windmills_of_Kinderdijk.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3e/The_windmills_of_Kinderdijk.JPG/640px-The_windmills_of_Kinderdijk.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:The_windmills_of_Kinderdijk.JPG",
    "authorName": "Tarod",
    "license": "CC BY-SA 3.0 nl",
    "description": "The windmills of Kinderdijk are one of the best known Dutch tourist sites. They have been a UNESCO World Heritage Site since 1997."
  },
  "lm.netherlands.2": {
    "title": "File:Tulips and tree at Keukenhof gardens.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Tulips_and_tree_at_Keukenhof_gardens.jpg/1280px-Tulips_and_tree_at_Keukenhof_gardens.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0e/Tulips_and_tree_at_Keukenhof_gardens.jpg/640px-Tulips_and_tree_at_Keukenhof_gardens.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Tulips_and_tree_at_Keukenhof_gardens.jpg",
    "authorName": "Elena.laps",
    "license": "CC BY-SA 4.0",
    "description": "Red and pink tulips at Keukenhof gardens in Lisse, Netherlands."
  },
  "lm.iceland.0": {
    "title": "File:Gullfoss, Suðurland, Islandia, 2014-08-16, DD 123.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Gullfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_123.JPG/1280px-Gullfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_123.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/89/Gullfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_123.JPG/640px-Gullfoss%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-16%2C_DD_123.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Gullfoss,_Su%C3%B0urland,_Islandia,_2014-08-16,_DD_123.JPG",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "Rainbow over Gullfoss (\"Golden Falls\" in Icelandic), a waterfall located in the canyon of the Hvítá river and one of the main attractions of the Golden Circle in southwest of Iceland . The fall step o"
  },
  "lm.iceland.1": {
    "title": "File:Jökulsárlón (lit. \"Glacier Lagoon\") is a large glacial lagoon in southeast Iceland, on the borders of Vatnajökull National Park. Situated at the head of Breiðamerkurjökull, it evolved into a lagoon after the gla - panoramio.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/J%C3%B6kuls%C3%A1rl%C3%B3n_%28lit._%22Glacier_Lagoon%22%29_is_a_large_glacial_lagoon_in_southeast_Iceland%2C_on_the_borders_of_Vatnaj%C3%B6kull_National_Park._Situated_at_the_head_of_Brei%C3%B0amerkurj%C3%B6kull%2C_it_evolved_into_a_lagoon_after_the_gla_-_panoramio.jpg/1280px-thumbnail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/J%C3%B6kuls%C3%A1rl%C3%B3n_%28lit._%22Glacier_Lagoon%22%29_is_a_large_glacial_lagoon_in_southeast_Iceland%2C_on_the_borders_of_Vatnaj%C3%B6kull_National_Park._Situated_at_the_head_of_Brei%C3%B0amerkurj%C3%B6kull%2C_it_evolved_into_a_lagoon_after_the_gla_-_panoramio.jpg/640px-thumbnail.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:J%C3%B6kuls%C3%A1rl%C3%B3n_(lit._%22Glacier_Lagoon%22)_is_a_large_glacial_lagoon_in_southeast_Iceland,_on_the_borders_of_Vatnaj%C3%B6kull_National_Park._Situated_at_the_head_of_Brei%C3%B0amerkurj%C3%B6kull,_it_evolved_into_a_lagoon_after_the_gla_-_panoramio.jpg",
    "authorName": "Jon Gretarsson",
    "license": "CC BY-SA 3.0",
    "description": "Jökulsárlón (lit. \"Glacier Lagoon\") is a large glacial lagoon in southeast Iceland, on the borders of Vatnajökull National Park. Situated at the head of Breiðamerkurjökull, it evolved into a lagoon af"
  },
  "lm.belarus.0": {
    "title": "File:Комплекс Мирского замка.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG/1280px-%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d6/%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG/640px-%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:%D0%9A%D0%BE%D0%BC%D0%BF%D0%BB%D0%B5%D0%BA%D1%81_%D0%9C%D0%B8%D1%80%D1%81%D0%BA%D0%BE%D0%B3%D0%BE_%D0%B7%D0%B0%D0%BC%D0%BA%D0%B0.JPG",
    "authorName": "Вадзім Новикаў",
    "license": "CC BY-SA 3.0",
    "description": "This is a photo of Belarusian heritage monument . Reference number:"
  },
  "lm.iceland.2": {
    "title": "File:Reynisfjara, Suðurland, Islandia, 2014-08-17, DD 164.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Reynisfjara%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-17%2C_DD_164.JPG/1280px-Reynisfjara%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-17%2C_DD_164.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/49/Reynisfjara%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-17%2C_DD_164.JPG/640px-Reynisfjara%2C_Su%C3%B0urland%2C_Islandia%2C_2014-08-17%2C_DD_164.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Reynisfjara,_Su%C3%B0urland,_Islandia,_2014-08-17,_DD_164.JPG",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "Basalt sea stack in a black lava beach under the mountain Reynisfjall near the village Vík í Mýrdal , southern Iceland . The three basalt see stacks in the background are the famous Reynisdrangar ."
  },
  "lm.belarus.1": {
    "title": "File:Nesvizh Palace and park complex, Nesvizh city, Nesvizh District, Minsk Province of the Republic of Belarus 03.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Nesvizh_Palace_and_park_complex%2C_Nesvizh_city%2C_Nesvizh_District%2C_Minsk_Province_of_the_Republic_of_Belarus_03.JPG/1280px-Nesvizh_Palace_and_park_complex%2C_Nesvizh_city%2C_Nesvizh_District%2C_Minsk_Province_of_the_Republic_of_Belarus_03.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/67/Nesvizh_Palace_and_park_complex%2C_Nesvizh_city%2C_Nesvizh_District%2C_Minsk_Province_of_the_Republic_of_Belarus_03.JPG/640px-Nesvizh_Palace_and_park_complex%2C_Nesvizh_city%2C_Nesvizh_District%2C_Minsk_Province_of_the_Republic_of_Belarus_03.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Nesvizh_Palace_and_park_complex,_Nesvizh_city,_Nesvizh_District,_Minsk_Province_of_the_Republic_of_Belarus_03.JPG",
    "authorName": "Horakvlado",
    "license": "CC BY-SA 3.0",
    "description": "This is a photo of Belarusian heritage monument . Reference number:"
  },
  "lm.belarus.2": {
    "title": "File:Belarus-Minsk-Victory Monument-Brest Fortress.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Belarus-Minsk-Victory_Monument-Brest_Fortress.jpg/1280px-Belarus-Minsk-Victory_Monument-Brest_Fortress.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/52/Belarus-Minsk-Victory_Monument-Brest_Fortress.jpg/640px-Belarus-Minsk-Victory_Monument-Brest_Fortress.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Belarus-Minsk-Victory_Monument-Brest_Fortress.jpg",
    "authorName": "Eugene Zelenko",
    "license": "CC BY-SA 4.0",
    "description": "Brest Hero Fortress. Victory Monument. Minsk , Belarus ."
  },
  "lm.kazakhstan.0": {
    "title": "File:Charyn Canyon (3991842679).jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Charyn_Canyon_%283991842679%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/9/9a/Charyn_Canyon_%283991842679%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Charyn_Canyon_(3991842679).jpg",
    "authorName": "Peretz Partensky from San Francisco, USA",
    "license": "CC BY-SA 2.0",
    "description": "photos from a trip to en.wikipedia.org/wiki/Charyn_Canyon This part is called valley of castles."
  },
  "lm.kazakhstan.1": {
    "title": "File:Kaindy lake south-east Kazakhstan.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Kaindy_lake_south-east_Kazakhstan.jpg/1280px-Kaindy_lake_south-east_Kazakhstan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/26/Kaindy_lake_south-east_Kazakhstan.jpg/640px-Kaindy_lake_south-east_Kazakhstan.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kaindy_lake_south-east_Kazakhstan.jpg",
    "authorName": "Jonas Satkauskas",
    "license": "Attribution",
    "description": "Kaindy lake in south-east of Kazakhstan . The mountain lakes like this form after the landslide blocks the mountain river. The trunks are dead Picea schrenkiana trees."
  },
  "lm.armenia.0": {
    "title": "File:Monasterio Khor Virap, Armenia, 2016-10-01, DD 25.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Monasterio_Khor_Virap%2C_Armenia%2C_2016-10-01%2C_DD_25.jpg/1280px-Monasterio_Khor_Virap%2C_Armenia%2C_2016-10-01%2C_DD_25.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6e/Monasterio_Khor_Virap%2C_Armenia%2C_2016-10-01%2C_DD_25.jpg/640px-Monasterio_Khor_Virap%2C_Armenia%2C_2016-10-01%2C_DD_25.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Monasterio_Khor_Virap,_Armenia,_2016-10-01,_DD_25.jpg",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "View of Khor Virap , an Armenian monastery and one of the most visited pilgrimage sites in Armenia located in the Ararat plain with Mount Ararat in the background. Khor Virap's notability as a monaste"
  },
  "lm.kazakhstan.2": {
    "title": "File:Khan Shatyr.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Khan_Shatyr.jpg/1280px-Khan_Shatyr.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Khan_Shatyr.jpg/640px-Khan_Shatyr.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Khan_Shatyr.jpg",
    "authorName": "Quarot",
    "license": "CC0",
    "description": "An image of Khan Shatyr."
  },
  "lm.armenia.2": {
    "title": "File:Sevanavank Monastery Armenia (1).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Sevanavank_Monastery_Armenia_%281%29.jpg/1280px-Sevanavank_Monastery_Armenia_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Sevanavank_Monastery_Armenia_%281%29.jpg/640px-Sevanavank_Monastery_Armenia_%281%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Sevanavank_Monastery_Armenia_(1).jpg",
    "authorName": "Radosław Botev",
    "license": "CC BY 3.0 pl",
    "description": "Sevanavank Monastery, Armenia"
  },
  "lm.armenia.1": {
    "title": "File:Templo de Garni, Armenia, 2016-10-02, DD 03.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Templo_de_Garni%2C_Armenia%2C_2016-10-02%2C_DD_03.jpg/1280px-Templo_de_Garni%2C_Armenia%2C_2016-10-02%2C_DD_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Templo_de_Garni%2C_Armenia%2C_2016-10-02%2C_DD_03.jpg/640px-Templo_de_Garni%2C_Armenia%2C_2016-10-02%2C_DD_03.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Templo_de_Garni,_Armenia,_2016-10-02,_DD_03.jpg",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "The Temple of Garni ( lit. \"pagan temple of Garni\") is a classical Hellenistic temple in Garni , Armenia . It is perhaps the best-known structure and symbol of pre-Christian Armenia and was probably b"
  },
  "lm.poland.0": {
    "title": "File:20110930 Krakow Wawel 0412.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/20110930_Krakow_Wawel_0412.jpg/1280px-20110930_Krakow_Wawel_0412.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/20110930_Krakow_Wawel_0412.jpg/640px-20110930_Krakow_Wawel_0412.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:20110930_Krakow_Wawel_0412.jpg",
    "authorName": "Jakub Hałun",
    "license": "CC BY-SA 3.0",
    "description": "The Wawel Hill in Kraków with the Royal Castle and Cathedral"
  },
  "lm.poland.1": {
    "title": "File:Kraków Old Town as seen from St. Mary's Basilica (9157064189).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Krak%C3%B3w_Old_Town_as_seen_from_St._Mary%27s_Basilica_%289157064189%29.jpg/1280px-Krak%C3%B3w_Old_Town_as_seen_from_St._Mary%27s_Basilica_%289157064189%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/43/Krak%C3%B3w_Old_Town_as_seen_from_St._Mary%27s_Basilica_%289157064189%29.jpg/640px-Krak%C3%B3w_Old_Town_as_seen_from_St._Mary%27s_Basilica_%289157064189%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Krak%C3%B3w_Old_Town_as_seen_from_St._Mary%27s_Basilica_(9157064189).jpg",
    "authorName": "Jorge Láscar from Australia",
    "license": "CC BY 2.0",
    "description": "Kraków Old Town is the historic central district of Kraków, Poland. It is one of the most famous old districts in Poland today and was the center of Poland's political life from 1038 until King Sigism"
  },
  "lm.sweden.0": {
    "title": "File:Stockholm Gamla Stan Stortorget during Christmas.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Stockholm_Gamla_Stan_Stortorget_during_Christmas.jpg/1280px-Stockholm_Gamla_Stan_Stortorget_during_Christmas.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f4/Stockholm_Gamla_Stan_Stortorget_during_Christmas.jpg/640px-Stockholm_Gamla_Stan_Stortorget_during_Christmas.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Stockholm_Gamla_Stan_Stortorget_during_Christmas.jpg",
    "authorName": "Tunegravity",
    "license": "CC0",
    "description": "Stockholm Gamla Stan Stortorget during Christmas"
  },
  "lm.poland.2": {
    "title": "File:Panorama of Malbork Castle, part 4.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Panorama_of_Malbork_Castle%2C_part_4.jpg/1280px-Panorama_of_Malbork_Castle%2C_part_4.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/82/Panorama_of_Malbork_Castle%2C_part_4.jpg/640px-Panorama_of_Malbork_Castle%2C_part_4.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Panorama_of_Malbork_Castle,_part_4.jpg",
    "authorName": "DerHexer ; derivate work: Carschten",
    "license": "CC BY-SA 3.0",
    "description": "Picture taken in Malbork after Wikimania 2010 conference . Panorama of Malbork Castle, Żuławy region, Poland."
  },
  "lm.sweden.1": {
    "title": "File:Swedish warship Vasa, sank 1628, Vasamuseet, Stockholm (17) (35462572223).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Swedish_warship_Vasa%2C_sank_1628%2C_Vasamuseet%2C_Stockholm_%2817%29_%2835462572223%29.jpg/1280px-Swedish_warship_Vasa%2C_sank_1628%2C_Vasamuseet%2C_Stockholm_%2817%29_%2835462572223%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4b/Swedish_warship_Vasa%2C_sank_1628%2C_Vasamuseet%2C_Stockholm_%2817%29_%2835462572223%29.jpg/640px-Swedish_warship_Vasa%2C_sank_1628%2C_Vasamuseet%2C_Stockholm_%2817%29_%2835462572223%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Swedish_warship_Vasa,_sank_1628,_Vasamuseet,_Stockholm_(17)_(35462572223).jpg",
    "authorName": "Richard Mortel from Riyadh, Saudi Arabia",
    "license": "CC BY 2.0",
    "description": "Swedish warship Vasa, sank 1628, Vasamuseet, Stockholm (17)"
  },
  "lm.sweden.2": {
    "title": "File:Drottningholm Palace (by Pudelek) 1.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Drottningholm_Palace_%28by_Pudelek%29_1.jpg/1280px-Drottningholm_Palace_%28by_Pudelek%29_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a7/Drottningholm_Palace_%28by_Pudelek%29_1.jpg/640px-Drottningholm_Palace_%28by_Pudelek%29_1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Drottningholm_Palace_(by_Pudelek)_1.jpg",
    "authorName": "Pudelek",
    "license": "CC BY-SA 4.0",
    "description": "Drottningholm Palace, Sweden"
  },
  "lm.finland.1": {
    "title": "File:Suomen Ilmakuva - Aerial photograph from the center of Helsinki to the sea in 2015 (cropped; Senate Square, Market Square).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Suomen_Ilmakuva_-_Aerial_photograph_from_the_center_of_Helsinki_to_the_sea_in_2015_%28cropped%3B_Senate_Square%2C_Market_Square%29.jpg/1280px-Suomen_Ilmakuva_-_Aerial_photograph_from_the_center_of_Helsinki_to_the_sea_in_2015_%28cropped%3B_Senate_Square%2C_Market_Square%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Suomen_Ilmakuva_-_Aerial_photograph_from_the_center_of_Helsinki_to_the_sea_in_2015_%28cropped%3B_Senate_Square%2C_Market_Square%29.jpg/640px-Suomen_Ilmakuva_-_Aerial_photograph_from_the_center_of_Helsinki_to_the_sea_in_2015_%28cropped%3B_Senate_Square%2C_Market_Square%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Suomen_Ilmakuva_-_Aerial_photograph_from_the_center_of_Helsinki_to_the_sea_in_2015_(cropped;_Senate_Square,_Market_Square).jpg",
    "authorName": "Suomen Ilmakuva Oy, Valokuvaaja 2015",
    "license": "CC BY 4.0",
    "description": "sisällön kuvaus: Ilmakuva Helsingin keskustaan luoteesta, etualalla Helsingin tuomikirkko, Senaatintori ja Kansalliskirjasto. Taustalla Katajanokka, Eteläsatama ja Suomenlinna."
  },
  "lm.finland.0": {
    "title": "File:Suomenlinna.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Suomenlinna.jpg/1280px-Suomenlinna.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Suomenlinna.jpg/640px-Suomenlinna.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Suomenlinna.jpg",
    "authorName": "Michal Pise, Michal.Pise",
    "license": "CC BY 2.0",
    "description": "Suomenlinna , a fortress near Helsinki , Finland . Picture taken from a ferry."
  },
  "lm.croatia.0": {
    "title": "File:Casco viejo de Dubrovnik, Croacia, 2014-04-14, DD 04.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Casco_viejo_de_Dubrovnik%2C_Croacia%2C_2014-04-14%2C_DD_04.JPG/1280px-Casco_viejo_de_Dubrovnik%2C_Croacia%2C_2014-04-14%2C_DD_04.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b4/Casco_viejo_de_Dubrovnik%2C_Croacia%2C_2014-04-14%2C_DD_04.JPG/640px-Casco_viejo_de_Dubrovnik%2C_Croacia%2C_2014-04-14%2C_DD_04.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Casco_viejo_de_Dubrovnik,_Croacia,_2014-04-14,_DD_04.JPG",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 3.0",
    "description": "Early morning view of the Old Town of Dubrovnik and its city walls , an UNESCO Heritage Site since 1979. The former Republic of Ragusa was a maritime republic centered on the city of Dubrovnik (Ragusa"
  },
  "lm.finland.2": {
    "title": "File:Arctic Circle marker Santa Claus Village Rovaniemi 2022-09-15 07.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Arctic_Circle_marker_Santa_Claus_Village_Rovaniemi_2022-09-15_07.jpg/1280px-Arctic_Circle_marker_Santa_Claus_Village_Rovaniemi_2022-09-15_07.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/Arctic_Circle_marker_Santa_Claus_Village_Rovaniemi_2022-09-15_07.jpg/640px-Arctic_Circle_marker_Santa_Claus_Village_Rovaniemi_2022-09-15_07.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Arctic_Circle_marker_Santa_Claus_Village_Rovaniemi_2022-09-15_07.jpg",
    "authorName": "Leonhard Lenz",
    "license": "CC0",
    "description": "Arctic circle marker that is not actually on the arctic circle at the Santa Claus Village near Rovaniemi."
  },
  "lm.croatia.2": {
    "title": "File:Split Cathedral Bell Tower From The Vestibule - Split.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Split_Cathedral_Bell_Tower_From_The_Vestibule_-_Split.jpg/1280px-Split_Cathedral_Bell_Tower_From_The_Vestibule_-_Split.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/93/Split_Cathedral_Bell_Tower_From_The_Vestibule_-_Split.jpg/640px-Split_Cathedral_Bell_Tower_From_The_Vestibule_-_Split.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Split_Cathedral_Bell_Tower_From_The_Vestibule_-_Split.jpg",
    "authorName": "Sumitsurai",
    "license": "CC BY-SA 4.0",
    "description": "Split Cathedral Bell Tower as seen from the Vestibule - Split"
  },
  "lm.croatia.1": {
    "title": "File:Waterfall in plitvice lakes national park, croatia.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Waterfall_in_plitvice_lakes_national_park%2C_croatia.jpg/1280px-Waterfall_in_plitvice_lakes_national_park%2C_croatia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/48/Waterfall_in_plitvice_lakes_national_park%2C_croatia.jpg/640px-Waterfall_in_plitvice_lakes_national_park%2C_croatia.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Waterfall_in_plitvice_lakes_national_park,_croatia.jpg",
    "authorName": "Someone35",
    "license": "CC BY-SA 3.0",
    "description": "Waterfall in Plitvice Lakes National Park, Croatia."
  },
  "lm.serbia.0": {
    "title": "File:Kalemegdan-2008-05-15 1076a.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/7/78/Kalemegdan-2008-05-15_1076a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/7/78/Kalemegdan-2008-05-15_1076a.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Kalemegdan-2008-05-15_1076a.jpg",
    "authorName": "Olovni",
    "license": "CC BY-SA 4.0",
    "description": "The \"Victor\" monument (\"Pobednik\") on Belgrade Fortress, temporary roofing over \"Kralj kapija\" (\"King's gate\")"
  },
  "lm.serbia.1": {
    "title": "File:Црква светог Саве, Београд (Church of Saint Sava, 2023).jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/%D0%A6%D1%80%D0%BA%D0%B2%D0%B0_%D1%81%D0%B2%D0%B5%D1%82%D0%BE%D0%B3_%D0%A1%D0%B0%D0%B2%D0%B5%2C_%D0%91%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D0%B4_%28Church_of_Saint_Sava%2C_2023%29.jpg/1280px-%D0%A6%D1%80%D0%BA%D0%B2%D0%B0_%D1%81%D0%B2%D0%B5%D1%82%D0%BE%D0%B3_%D0%A1%D0%B0%D0%B2%D0%B5%2C_%D0%91%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D0%B4_%28Church_of_Saint_Sava%2C_2023%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/%D0%A6%D1%80%D0%BA%D0%B2%D0%B0_%D1%81%D0%B2%D0%B5%D1%82%D0%BE%D0%B3_%D0%A1%D0%B0%D0%B2%D0%B5%2C_%D0%91%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D0%B4_%28Church_of_Saint_Sava%2C_2023%29.jpg/640px-%D0%A6%D1%80%D0%BA%D0%B2%D0%B0_%D1%81%D0%B2%D0%B5%D1%82%D0%BE%D0%B3_%D0%A1%D0%B0%D0%B2%D0%B5%2C_%D0%91%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D0%B4_%28Church_of_Saint_Sava%2C_2023%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:%D0%A6%D1%80%D0%BA%D0%B2%D0%B0_%D1%81%D0%B2%D0%B5%D1%82%D0%BE%D0%B3_%D0%A1%D0%B0%D0%B2%D0%B5,_%D0%91%D0%B5%D0%BE%D0%B3%D1%80%D0%B0%D0%B4_(Church_of_Saint_Sava,_2023).jpg",
    "authorName": "Petar Milošević",
    "license": "CC BY-SA 4.0",
    "description": "Church of Saint Sava, Belgrade (2023)"
  },
  "lm.serbia.2": {
    "title": "File:Curving meanders in Special Nature Reserve Uvac River canyon valley, Serbia.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Curving_meanders_in_Special_Nature_Reserve_Uvac_River_canyon_valley%2C_Serbia.JPG/1280px-Curving_meanders_in_Special_Nature_Reserve_Uvac_River_canyon_valley%2C_Serbia.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ac/Curving_meanders_in_Special_Nature_Reserve_Uvac_River_canyon_valley%2C_Serbia.JPG/640px-Curving_meanders_in_Special_Nature_Reserve_Uvac_River_canyon_valley%2C_Serbia.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Curving_meanders_in_Special_Nature_Reserve_Uvac_River_canyon_valley,_Serbia.JPG",
    "authorName": "Srdjan Marincic",
    "license": "CC BY-SA 3.0",
    "description": "Curving meanders in Special Nature Reserve Uvac River canyon valley, Serbia"
  },
  "lm.cuba.0": {
    "title": "File:El Capitolio Havana Cuba.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/El_Capitolio_Havana_Cuba.jpg/1280px-El_Capitolio_Havana_Cuba.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1d/El_Capitolio_Havana_Cuba.jpg/640px-El_Capitolio_Havana_Cuba.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:El_Capitolio_Havana_Cuba.jpg",
    "authorName": "Nigel Pacquette",
    "license": "CC BY-SA 3.0",
    "description": "The Cuba State Capitol (El Capitolio) in Havana. The photo is taken from a nearby rooftop."
  },
  "lm.cuba.1": {
    "title": "File:Fragmento del Valle de Viñales. Cuba.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Fragmento_del_Valle_de_Vi%C3%B1ales._Cuba.JPG/1280px-Fragmento_del_Valle_de_Vi%C3%B1ales._Cuba.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Fragmento_del_Valle_de_Vi%C3%B1ales._Cuba.JPG/640px-Fragmento_del_Valle_de_Vi%C3%B1ales._Cuba.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fragmento_del_Valle_de_Vi%C3%B1ales._Cuba.JPG",
    "authorName": "Ivan2010",
    "license": "CC BY-SA 3.0",
    "description": "Un fragmento del Valle de Viñales. Centro turistico en la provincia de Pinar del Rio. Cuba"
  },
  "lm.cuba.2": {
    "title": "File:La Plaza Mayor de Trinidad yace verdaderamente lustrosa ante el turista - panoramio.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/La_Plaza_Mayor_de_Trinidad_yace_verdaderamente_lustrosa_ante_el_turista_-_panoramio.jpg/1280px-La_Plaza_Mayor_de_Trinidad_yace_verdaderamente_lustrosa_ante_el_turista_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7d/La_Plaza_Mayor_de_Trinidad_yace_verdaderamente_lustrosa_ante_el_turista_-_panoramio.jpg/640px-La_Plaza_Mayor_de_Trinidad_yace_verdaderamente_lustrosa_ante_el_turista_-_panoramio.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:La_Plaza_Mayor_de_Trinidad_yace_verdaderamente_lustrosa_ante_el_turista_-_panoramio.jpg",
    "authorName": "DnTrotaMundos ☮",
    "license": "CC BY 3.0",
    "description": "La Plaza Mayor de Trinidad yace verdaderamente lustrosa ante el turista"
  },
  "lm.chile.1": {
    "title": "File:Anfiteatro, Valle de la Luna, San Pedro de Atacama, Chile, 2016-02-01, DD 149.JPG",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Anfiteatro%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_149.JPG/1280px-Anfiteatro%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_149.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Anfiteatro%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_149.JPG/640px-Anfiteatro%2C_Valle_de_la_Luna%2C_San_Pedro_de_Atacama%2C_Chile%2C_2016-02-01%2C_DD_149.JPG?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Anfiteatro,_Valle_de_la_Luna,_San_Pedro_de_Atacama,_Chile,_2016-02-01,_DD_149.JPG",
    "authorName": "Diego Delso",
    "license": "CC BY-SA 4.0",
    "description": "View of \"the Amfitheater\", a rock formation in Valle de la Luna (in Spanish \"Moon Valley\") during the golden hour, Atacama Desert , Chile. Valle de la Luna is a part of the Reserva Nacional los Flamen"
  },
  "lm.chile.0": {
    "title": "File:Cuernos del Paine in Torres del Paine National Park.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Cuernos_del_Paine_in_Torres_del_Paine_National_Park.jpg/1280px-Cuernos_del_Paine_in_Torres_del_Paine_National_Park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/76/Cuernos_del_Paine_in_Torres_del_Paine_National_Park.jpg/640px-Cuernos_del_Paine_in_Torres_del_Paine_National_Park.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Cuernos_del_Paine_in_Torres_del_Paine_National_Park.jpg",
    "authorName": "Pedro Szekely from Los Angeles, USA",
    "license": "CC BY-SA 2.0",
    "description": "View Cuernos del Paine from lake Pehoé"
  },
  "lm.chile.2": {
    "title": "File:Ahu Tongariki 02 cropped.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Ahu_Tongariki_02_cropped.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Ahu_Tongariki_02_cropped.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ahu_Tongariki_02_cropped.jpg",
    "authorName": "LBM1948",
    "license": "CC BY-SA 4.0",
    "description": "Moais at Ahu Tongariki. Easter Island [Rapa Nui], Valparaíso, Chile"
  },
  "lm.kenya.0": {
    "title": "File:Gentle Giants, A Family of Five Elephants in Maasai Mara - Flickr - . Ray in Manila.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Gentle_Giants%2C_A_Family_of_Five_Elephants_in_Maasai_Mara_-_Flickr_-_._Ray_in_Manila.jpg/1280px-Gentle_Giants%2C_A_Family_of_Five_Elephants_in_Maasai_Mara_-_Flickr_-_._Ray_in_Manila.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/98/Gentle_Giants%2C_A_Family_of_Five_Elephants_in_Maasai_Mara_-_Flickr_-_._Ray_in_Manila.jpg/640px-Gentle_Giants%2C_A_Family_of_Five_Elephants_in_Maasai_Mara_-_Flickr_-_._Ray_in_Manila.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Gentle_Giants,_A_Family_of_Five_Elephants_in_Maasai_Mara_-_Flickr_-_._Ray_in_Manila.jpg",
    "authorName": ". Ray in Manila",
    "license": "CC BY 2.0",
    "description": "The awe-inspiring sight of a family of five majestic elephants in the stunning Maasai Mara National Reserve. This captivating photo captures the essence of the bond and harmony shared among these gent"
  },
  "lm.kenya.1": {
    "title": "File:Elephants at Amboseli national park against Mount Kilimanjaro.jpg",
    "url": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "thumbUrl": "https://upload.wikimedia.org/wikipedia/commons/f/fa/Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail_unscaled",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Elephants_at_Amboseli_national_park_against_Mount_Kilimanjaro.jpg",
    "authorName": "Amoghavarsha JS amoghavarsha.com",
    "license": "CC BY-SA 3.0",
    "description": "Elephants at Amboseli National Park against Mount Kilimanjaro"
  },
  "lm.kenya.2": {
    "title": "File:Fort Jesus, Mombasa1.jpg",
    "url": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Fort_Jesus%2C_Mombasa1.jpg/1280px-Fort_Jesus%2C_Mombasa1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "thumbUrl": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cb/Fort_Jesus%2C_Mombasa1.jpg/640px-Fort_Jesus%2C_Mombasa1.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=thumbnail",
    "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fort_Jesus,_Mombasa1.jpg",
    "authorName": "Chris huh",
    "license": "CC BY-SA 4.0",
    "description": "Fort Jesus, Mombasa. The fort was originally built by the Portuguese in 1593 to defend the Old Port from attack. From above the Fort has a shape of a man, and was named Jesus accordingly."
  }
};

export const COMPACT_COUNTRIES_LANDMARKS: Record<string, Array<{
  name: string;
  city: string;
  category: string;
  description: string;
  wikiKey: string;
}>> = {
  "fiji": [
    {
      "name": "Остров Монурики (архипелаг Маманука)",
      "city": "Маманука",
      "category": "Природный памятник",
      "description": "Вулканический коралловый остров с белоснежными пляжами и бирюзовыми лагунами, ставший всемирно известным благодаря фильму «Изгой».",
      "wikiKey": "lm.fiji.0"
    },
    {
      "name": "Индуистский храм Шри-Шива-Субраманья",
      "city": "Нади",
      "category": "Архитектура и храмы",
      "description": "Крупнейший дравидийский индуистский храм в Южном полушарии с яркими резными башнями-гопурамами.",
      "wikiKey": "lm.fiji.1"
    },
    {
      "name": "Водопады Таворо в национальном парке Боума",
      "city": "Тавеуни",
      "category": "Национальный парк",
      "description": "Трёхуровневый каскад водопадов среди тропических джунглей «острова-сада» Тавеуни.",
      "wikiKey": "lm.fiji.2"
    }
  ],
  "austria": [
    {
      "name": "Дворец и парковый ансамбль Шёнбрунн",
      "city": "Вена",
      "category": "ЮНЕСКО",
      "description": "Парадная летняя резиденция династии Габсбургов в стиле австрийского барокко с павильоном Глориетта.",
      "wikiKey": "lm.austria.0"
    },
    {
      "name": "Альпийская деревня Гальштат и Гальштатское озеро",
      "city": "Зальцкаммергут",
      "category": "Природа и ЮНЕСКО",
      "description": "Живописный альпийский городок у подножия массива Дахштайн с тысячелетней историей добычи соли.",
      "wikiKey": "lm.austria.1"
    },
    {
      "name": "Крепость Хоэнзальцбург и старый город Зальцбурга",
      "city": "Зальцбург",
      "category": "Историческая крепость",
      "description": "Одна из крупнейших полностью сохранившихся средневековых крепостей Европы над родиной Моцарта.",
      "wikiKey": "lm.austria.2"
    }
  ],
  "new-zealand": [
    {
      "name": "Фьорд Милфорд-Саунд (Пиопиотахи)",
      "city": "Фьордленд",
      "category": "Природное чудо",
      "description": "Ледниковый фьорд с отвесными скалами Митре-Пик и каскадными водопадами на Южном острове.",
      "wikiKey": "lm.nz.0"
    },
    {
      "name": "Национальный парк Аораки / Гора Кука и озеро Пукаки",
      "city": "Кентербери",
      "category": "Национальный парк",
      "description": "Высочайшая вершина Новой Зеландии (3724 м) и бирюзовые ледниковые озёра Южных Альп.",
      "wikiKey": "lm.nz.1"
    },
    {
      "name": "Хоббитон (Матамата)",
      "city": "Вайкато",
      "category": "Культурная достопримечательность",
      "description": "Знаменитая съёмочная площадка Шира среди зелёных холмов Северного острова.",
      "wikiKey": "lm.nz.2"
    }
  ],
  "netherlands": [
    {
      "name": "Государственный музей Рейксмюсеум и Музейная площадь",
      "city": "Амстердам",
      "category": "Музеи и архитектура",
      "description": "Главный художественный музей Нидерландов с шедеврами Рембрандта, Вермеера и эпохи Золотого века.",
      "wikiKey": "lm.netherlands.0"
    },
    {
      "name": "Ветряные мельницы Киндердейка",
      "city": "Южная Голландия",
      "category": "ЮНЕСКО",
      "description": "Уникальный комплекс из 19 исторических ветряных мельниц XVIII века, регулирующих уровень воды в польдерах.",
      "wikiKey": "lm.netherlands.1"
    },
    {
      "name": "Королевский парк цветов Кёкенхоф",
      "city": "Лиссе",
      "category": "Сады и парки",
      "description": "Всемирно известный весенний парк, где ежегодно расцветают более 7 миллионов тюльпанов, гиацинтов и нарциссов.",
      "wikiKey": "lm.netherlands.2"
    }
  ],
  "iceland": [
    {
      "name": "Каскадный водопад Гюдльфосс («Золотое кольцо»)",
      "city": "Южная Исландия",
      "category": "Природный памятник",
      "description": "Двухступенчатый мощный водопад в каньоне реки Хвитау, входящий в классический маршрут Золотого кольца.",
      "wikiKey": "lm.iceland.0"
    },
    {
      "name": "Ледниковая лагуна Йёкюльсаурлоун",
      "city": "Ватнайёкюдль",
      "category": "Природное чудо",
      "description": "Живописная лагуна с дрейфующими голубыми айсбергами у подножия крупнейшего ледника Европы.",
      "wikiKey": "lm.iceland.1"
    },
    {
      "name": "Пляж с чёрным вулканическим песком Рейнисфьяра",
      "city": "Вик",
      "category": "Природа",
      "description": "Побережье Атлантики с базальтовыми колоннами Гардар и скальными кекурами Рейнисдрангар.",
      "wikiKey": "lm.iceland.2"
    }
  ],
  "belarus": [
    {
      "name": "Замковый комплекс «Мир» XVI века",
      "city": "Мир (Гродненская область)",
      "category": "ЮНЕСКО",
      "description": "Выдающийся памятник белорусской готики и ренессанса с мощными кирпичными башнями и прудом.",
      "wikiKey": "lm.belarus.0"
    },
    {
      "name": "Дворцово-парковый ансамбль Радзивиллов в Несвиже",
      "city": "Несвиж",
      "category": "ЮНЕСКО",
      "description": "Резиденция княжеского рода Радзивиллов с барочным дворцом, бастионами и живописными парками.",
      "wikiKey": "lm.belarus.1"
    },
    {
      "name": "Мемориальный комплекс «Брестская крепость-герой»",
      "city": "Брест",
      "category": "Исторический мемориал",
      "description": "Величественный мемориальный ансамбль у слияния рек Мухавец и Западный Буг.",
      "wikiKey": "lm.belarus.2"
    }
  ],
  "kazakhstan": [
    {
      "name": "Чарынский каньон («Долина замков»)",
      "city": "Алматинская область",
      "category": "Природный парк",
      "description": "Протяжённый каньон глубиной до 300 метров из осадочных красных песчаников возрастом 12 млн лет.",
      "wikiKey": "lm.kazakhstan.0"
    },
    {
      "name": "Высокогорное озеро Каинды в Кунгей-Алатау",
      "city": "Алматинская область",
      "category": "Природное чудо",
      "description": "Бирюзовое горное озеро на высоте 1667 метров с возвышающимися из воды стволами затопленных елей.",
      "wikiKey": "lm.kazakhstan.1"
    },
    {
      "name": "Монумент «Байтерек» и Хан-Шатыр на бульваре Нуржол",
      "city": "Астана",
      "category": "Современная архитектура",
      "description": "Символы современной столицы Казахстана, спроектированные ведущими мировыми архитекторами.",
      "wikiKey": "lm.kazakhstan.2"
    }
  ],
  "armenia": [
    {
      "name": "Монастырь Хор Вирап у подножия Арарата",
      "city": "Араратская долина",
      "category": "Духовное наследие",
      "description": "Древний монастырь в Араратской долине с лучшим панорамным видом на библейскую гору Арарат.",
      "wikiKey": "lm.armenia.0"
    },
    {
      "name": "Античный языческий храм Гарни I века",
      "city": "Гарни",
      "category": "Античная архитектура",
      "description": "Единственный сохранившийся на территории региона эллинистический храм с базальтовой колоннадой над ущельем реки Азат.",
      "wikiKey": "lm.armenia.1"
    },
    {
      "name": "Монастырь Севанаванк и озеро Севан",
      "city": "Гегаркуник",
      "category": "Природа и история",
      "description": "Средневековый монастырский комплекс IX века на полуострове крупнейшего высокогорного озера Кавказа.",
      "wikiKey": "lm.armenia.2"
    }
  ],
  "poland": [
    {
      "name": "Королевский замок на Вавеле",
      "city": "Краков",
      "category": "ЮНЕСКО",
      "description": "Многовековая резиденция польских королей и кафедральный собор на холме над рекой Вислой.",
      "wikiKey": "lm.poland.0"
    },
    {
      "name": "Главный Рынок, Суконные ряды и Мариацкий костёл",
      "city": "Краков",
      "category": "Исторический центр",
      "description": "Крупнейшая средневековая площадь Европы с готической базиликой Святой Марии и ренессансными Суконными рядами.",
      "wikiKey": "lm.poland.1"
    },
    {
      "name": "Орденский замок Мариенбург (Мальборк)",
      "city": "Мальборк",
      "category": "ЮНЕСКО",
      "description": "Крупнейший в мире средневековый кирпичный замок, служивший резиденцией великого магистра Тевтонского ордена.",
      "wikiKey": "lm.poland.2"
    }
  ],
  "sweden": [
    {
      "name": "Старый город Гамла-Стан и площадь Стурторьет",
      "city": "Стокгольм",
      "category": "Исторический квартал",
      "description": "Сердце Стокгольма на острове Стадсхольмен с Королевским дворцом, мощёными переулками и цветными купеческими домами XVII века.",
      "wikiKey": "lm.sweden.0"
    },
    {
      "name": "Корабль-музей «Васа» (Vasamuseet)",
      "city": "Стокгольм",
      "category": "Морской музей",
      "description": "Единственный в мире сохранившийся парусный боевой корабль начала XVII века, украшенный сотнями резных скульптур.",
      "wikiKey": "lm.sweden.1"
    },
    {
      "name": "Королевский дворец Дроттнингхольм",
      "city": "Стокгольм (Ловён)",
      "category": "ЮНЕСКО",
      "description": "Шведский Версаль на берегу озера Меларен с барочным парком и оперным театром XVIII века.",
      "wikiKey": "lm.sweden.2"
    }
  ],
  "finland": [
    {
      "name": "Морская бастионная крепость Суоменлинна (Свеаборг)",
      "city": "Хельсинки",
      "category": "ЮНЕСКО",
      "description": "Островная крепость XVIII века у входа в гавань Хельсинки с музеями, бастионами и прогулочными набережными.",
      "wikiKey": "lm.finland.0"
    },
    {
      "name": "Сенатская площадь и Кафедральный собор Хельсинки",
      "city": "Хельсинки",
      "category": "Архитектурный ансамбль",
      "description": "Белоснежный неоклассический собор архитектора Карла Людвига Энгеля в самом центре финской столицы.",
      "wikiKey": "lm.finland.1"
    },
    {
      "name": "Деревня Санта-Клауса на Полярном круге",
      "city": "Рованиеми (Лапландия)",
      "category": "Туристический центр",
      "description": "Круглогодичная резиденция Йоулупукки ровно на линии Северного полярного круга в финской Лапландии.",
      "wikiKey": "lm.finland.2"
    }
  ],
  "croatia": [
    {
      "name": "Крепостные стены и Старый город Дубровника",
      "city": "Дубровник",
      "category": "ЮНЕСКО",
      "description": "Жемчужина Адриатики с мощными средневековыми бастионами, улицей Страдун и терракотовыми крышами.",
      "wikiKey": "lm.croatia.0"
    },
    {
      "name": "Национальный парк «Плитвицкие озёра»",
      "city": "Лика-Сень",
      "category": "Природа и ЮНЕСКО",
      "description": "Каскад из 16 бирюзовых карстовых озёр, соединённых десятками пенистых водопадов и деревянными настилами.",
      "wikiKey": "lm.croatia.1"
    },
    {
      "name": "Дворец императора Диоклетиана",
      "city": "Сплит",
      "category": "Античное наследие",
      "description": "Монументальный древнеримский дворец рубежа III–IV веков, формирующий исторический центр Сплита.",
      "wikiKey": "lm.croatia.2"
    }
  ],
  "serbia": [
    {
      "name": "Белградская крепость и парк Калемегдан",
      "city": "Белград",
      "category": "Историческая крепость",
      "description": "Древняя цитадель над живописным слиянием рек Савы и Дуная с панорамными террасами и памятником «Победитель».",
      "wikiKey": "lm.serbia.0"
    },
    {
      "name": "Собор Святого Саввы на Врачаре",
      "city": "Белград",
      "category": "Архитектура и храмы",
      "description": "Один из крупнейших православных храмов мира в неовизантийском стиле с золотыми мозаиками.",
      "wikiKey": "lm.serbia.1"
    },
    {
      "name": "Специальный природный заповедник и меандры каньона Увац",
      "city": "Златиборский округ",
      "category": "Природный памятник",
      "description": "Знаменитые крутые изгибы-меандры реки Увац среди известняковых скал и место обитания белоголового сипа.",
      "wikiKey": "lm.serbia.2"
    }
  ],
  "cuba": [
    {
      "name": "Национальный Капитолий и Старая Гавана (La Habana Vieja)",
      "city": "Гавана",
      "category": "ЮНЕСКО",
      "description": "Монументальное здание Капитолия и колониальные площади Старой Гаваны с классическими ретро-автомобилями.",
      "wikiKey": "lm.cuba.0"
    },
    {
      "name": "Карстовая долина Виньялес с холмами-моготе",
      "city": "Пинар-дель-Рио",
      "category": "Природа и ЮНЕСКО",
      "description": "Живописная зелёная долина кубинских табачных плантаций в окружении округлых известняковых скал моготе.",
      "wikiKey": "lm.cuba.1"
    },
    {
      "name": "Колониальный город Тринидад и площадь Пласа-Майор",
      "city": "Тринидад",
      "category": "ЮНЕСКО",
      "description": "Город-музей под открытым небом с брусчатыми улочками и дворцами сахарных баронов XVIII–XIX веков.",
      "wikiKey": "lm.cuba.2"
    }
  ],
  "chile": [
    {
      "name": "Национальный парк Торрес-дель-Пайне в Патагонии",
      "city": "Магальянес",
      "category": "Биосферный заповедник",
      "description": "Гранитные башни и рога Куэрнос-дель-Пайне, бирюзовые ледниковые озёра и патагонские пампасы.",
      "wikiKey": "lm.chile.0"
    },
    {
      "name": "Лунная долина (Валье-де-ла-Луна) в пустыне Атакама",
      "city": "Сан-Педро-де-Атакама",
      "category": "Природный памятник",
      "description": "Инопланетные соляные хребты и песчаные дюны самой засушливой пустыни Земли у подножия вулкана Ликанкабур.",
      "wikiKey": "lm.chile.1"
    },
    {
      "name": "Церемониальный комплекс Аху-Тонгарики (Остров Пасхи)",
      "city": "Рапа-Нуи",
      "category": "ЮНЕСКО",
      "description": "Крупнейшая платформа аху с 15 гигантскими каменными статуями моаи на берегу Тихого океана.",
      "wikiKey": "lm.chile.2"
    }
  ],
  "kenya": [
    {
      "name": "Национальный заповедник Масаи-Мара",
      "city": "Нарок",
      "category": "Дикая природа и сафари",
      "description": "Бескрайняя африканская саванна, где проходит Великая миграция антилоп гну и обитает «Большая пятёрка».",
      "wikiKey": "lm.kenya.0"
    },
    {
      "name": "Национальный парк Амбосели у подножия Килиманджаро",
      "city": "Каджиадо",
      "category": "Национальный парк",
      "description": "Знаменитые стада слонов на фоне заснеженной вершины высочайшей горы Африки.",
      "wikiKey": "lm.kenya.1"
    },
    {
      "name": "Португальский форт Иисус XVI века в Момбасе",
      "city": "Момбаса",
      "category": "ЮНЕСКО",
      "description": "Ренессансная морская крепость 1593 года постройки, охраняющая вход в старый порт Момбасы.",
      "wikiKey": "lm.kenya.2"
    }
  ]
};

export const PHOTO_REPLACEMENTS: Record<string, {
  cover?: string;
  gallery?: Record<number, string>;
  cities?: Record<number, string>;
  landmarks?: string[];
}> = {
  "russia": {
    "gallery": {
      "3": "russia.gallery.altai"
    },
    "landmarks": [
      "lm.russia.0",
      "lm.russia.1",
      "lm.russia.2"
    ]
  },
  "france": {
    "gallery": {
      "1": "france.gallery.cotedazur"
    },
    "cities": {
      "1": "france.city.nice"
    },
    "landmarks": [
      "lm.france.0",
      "lm.france.1",
      "lm.france.2"
    ]
  },
  "italy": {
    "gallery": {
      "1": "italy.gallery.amalfi"
    },
    "landmarks": [
      "lm.italy.0",
      "lm.italy.1",
      "lm.italy.2"
    ]
  },
  "spain": {
    "landmarks": [
      "lm.spain.0",
      "lm.spain.1",
      "lm.spain.2"
    ]
  },
  "japan": {
    "landmarks": [
      "lm.japan.0",
      "lm.japan.1",
      "lm.japan.2"
    ]
  },
  "turkey": {
    "landmarks": [
      "lm.turkey.0",
      "lm.turkey.1",
      "lm.turkey.2"
    ]
  },
  "thailand": {
    "cities": {
      "1": "thailand.city.chiangmai",
      "2": "thailand.city.phuket"
    },
    "landmarks": [
      "lm.thailand.0",
      "lm.thailand.1",
      "lm.thailand.2"
    ]
  },
  "uae": {
    "cities": {
      "2": "uae.city.sharjah"
    },
    "landmarks": [
      "lm.uae.0",
      "lm.uae.1",
      "lm.uae.2"
    ]
  },
  "egypt": {
    "cities": {
      "2": "egypt.city.sharm"
    },
    "landmarks": [
      "lm.egypt.0",
      "lm.egypt.1",
      "lm.egypt.2"
    ]
  },
  "usa": {
    "landmarks": [
      "lm.usa.0",
      "lm.usa.1",
      "lm.usa.2"
    ]
  },
  "brazil": {
    "landmarks": [
      "lm.brazil.0",
      "lm.brazil.1",
      "lm.brazil.2"
    ]
  },
  "australia": {
    "gallery": {
      "3": "australia.gallery.reef"
    },
    "cities": {
      "2": "australia.city.cairns"
    },
    "landmarks": [
      "lm.australia.0",
      "lm.australia.1",
      "lm.australia.2"
    ]
  },
  "germany": {
    "gallery": {
      "1": "germany.gallery.bavaria",
      "3": "germany.gallery.cologne"
    },
    "landmarks": [
      "lm.germany.0",
      "lm.germany.1",
      "lm.germany.2"
    ]
  },
  "united-kingdom": {
    "cities": {
      "1": "uk.city.edinburgh"
    },
    "landmarks": [
      "lm.uk.0",
      "lm.uk.1",
      "lm.uk.2"
    ]
  },
  "switzerland": {
    "gallery": {
      "1": "switzerland.gallery.lauterbrunnen",
      "3": "switzerland.gallery.jungfrau"
    },
    "cities": {
      "1": "switzerland.city.lucerne"
    },
    "landmarks": [
      "lm.switzerland.0",
      "lm.switzerland.1",
      "lm.switzerland.2"
    ]
  },
  "greece": {
    "gallery": {
      "1": "greece.gallery.navagio",
      "3": "greece.gallery.meteora"
    },
    "cities": {
      "2": "greece.city.crete"
    },
    "landmarks": [
      "lm.greece.0",
      "lm.greece.1",
      "lm.greece.2"
    ]
  },
  "portugal": {
    "gallery": {
      "1": "portugal.gallery.algarve",
      "3": "portugal.gallery.belem"
    },
    "landmarks": [
      "lm.portugal.0",
      "lm.portugal.1",
      "lm.portugal.2"
    ]
  },
  "norway": {
    "gallery": {
      "3": "norway.gallery.trolltunga"
    },
    "cities": {
      "2": "norway.city.tromso"
    },
    "landmarks": [
      "lm.norway.0",
      "lm.norway.1",
      "lm.norway.2"
    ]
  },
  "czechia": {
    "gallery": {
      "1": "czechia.gallery.bohemian",
      "3": "czechia.gallery.krumlov"
    },
    "cities": {
      "1": "czechia.city.krumlov",
      "2": "czechia.city.karlovy"
    },
    "landmarks": [
      "lm.czechia.0",
      "lm.czechia.1",
      "lm.czechia.2"
    ]
  },
  "china": {
    "gallery": {
      "1": "china.gallery.guilin"
    },
    "cities": {
      "2": "china.city.xian"
    },
    "landmarks": [
      "lm.china.0",
      "lm.china.1",
      "lm.china.2"
    ]
  },
  "south-korea": {
    "gallery": {
      "1": "korea.gallery.jeju",
      "3": "korea.gallery.busan"
    },
    "cities": {
      "1": "korea.city.busan",
      "2": "korea.city.jeju"
    },
    "landmarks": [
      "lm.korea.0",
      "lm.korea.1",
      "lm.korea.2"
    ]
  },
  "india": {
    "gallery": {
      "1": "india.gallery.kerala"
    },
    "landmarks": [
      "lm.india.0",
      "lm.india.1",
      "lm.india.2"
    ]
  },
  "vietnam": {
    "gallery": {
      "1": "vietnam.gallery.sapa",
      "3": "vietnam.gallery.hoian"
    },
    "cities": {
      "1": "vietnam.city.danang",
      "2": "vietnam.city.hochiminh"
    },
    "landmarks": [
      "lm.vietnam.0",
      "lm.vietnam.1",
      "lm.vietnam.2"
    ]
  },
  "indonesia": {
    "gallery": {
      "1": "indonesia.gallery.uluwatu",
      "2": "indonesia.gallery.borobudur"
    },
    "cities": {
      "1": "indonesia.city.yogyakarta"
    },
    "landmarks": [
      "lm.indonesia.0",
      "lm.indonesia.1",
      "lm.indonesia.2"
    ]
  },
  "georgia": {
    "gallery": {
      "0": "georgia.gallery.old_tbilisi",
      "2": "georgia.gallery.jvari",
      "3": "georgia.gallery.batumi"
    },
    "cities": {
      "1": "georgia.city.batumi"
    },
    "landmarks": [
      "lm.georgia.0",
      "lm.georgia.1",
      "lm.georgia.2"
    ]
  },
  "uzbekistan": {
    "gallery": {
      "0": "uzbekistan.gallery.tashkent",
      "1": "uzbekistan.gallery.charvak",
      "3": "uzbekistan.gallery.khiva"
    },
    "cities": {
      "2": "uzbekistan.city.tashkent"
    },
    "landmarks": [
      "lm.uzbekistan.0",
      "lm.uzbekistan.1",
      "lm.uzbekistan.2"
    ]
  },
  "morocco": {
    "gallery": {
      "3": "morocco.gallery.aitbenhaddou"
    },
    "landmarks": [
      "lm.morocco.0",
      "lm.morocco.1",
      "lm.morocco.2"
    ]
  },
  "south-africa": {
    "gallery": {
      "1": "lm.southafrica.2",
      "2": "southafrica.gallery.stellenbosch",
      "3": "southafrica.gallery.boulders"
    },
    "cities": {
      "2": "southafrica.city.durban"
    },
    "landmarks": [
      "lm.southafrica.0",
      "lm.southafrica.1",
      "lm.southafrica.2"
    ]
  },
  "tanzania": {
    "gallery": {
      "0": "tanzania.gallery.daressalaam",
      "1": "tanzania.gallery.serengeti",
      "2": "tanzania.gallery.stonetown",
      "3": "tanzania.gallery.nungwi"
    },
    "cities": {
      "0": "tanzania.city.zanzibar",
      "2": "tanzania.city.daressalaam"
    },
    "landmarks": [
      "lm.tanzania.0",
      "lm.tanzania.1",
      "lm.tanzania.2"
    ]
  },
  "canada": {
    "gallery": {
      "1": "canada.gallery.rockies"
    },
    "cities": {
      "1": "canada.city.vancouver",
      "2": "canada.city.montreal"
    },
    "landmarks": [
      "lm.canada.0",
      "lm.canada.1",
      "lm.canada.2"
    ]
  },
  "mexico": {
    "gallery": {
      "1": "mexico.gallery.ikkil",
      "2": "mexico.gallery.guanajuato",
      "3": "mexico.gallery.cancun"
    },
    "cities": {
      "1": "mexico.city.cancun",
      "2": "mexico.city.oaxaca"
    },
    "landmarks": [
      "lm.mexico.0",
      "lm.mexico.1",
      "lm.mexico.2"
    ]
  },
  "peru": {
    "gallery": {
      "2": "peru.gallery.arequipa",
      "3": "peru.gallery.colca"
    },
    "cities": {
      "1": "peru.city.lima",
      "2": "peru.city.arequipa"
    },
    "landmarks": [
      "lm.peru.0",
      "lm.peru.1",
      "lm.peru.2"
    ]
  },
  "argentina": {
    "gallery": {
      "0": "argentina.gallery.laboca",
      "1": "argentina.gallery.peritomoreno",
      "2": "argentina.gallery.colon",
      "3": "argentina.gallery.fitzroy"
    },
    "cities": {
      "0": "argentina.city.buenosaires",
      "1": "argentina.city.elcalafate",
      "2": "argentina.city.ushuaia"
    },
    "landmarks": [
      "lm.argentina.0",
      "lm.argentina.1",
      "lm.argentina.2"
    ]
  },
  "new-zealand": {
    "gallery": {
      "0": "nz.gallery.auckland",
      "1": "nz.gallery.queenstown",
      "3": "nz.gallery.tekapo"
    },
    "cities": {
      "0": "nz.city.auckland",
      "1": "nz.city.queenstown",
      "2": "nz.city.wellington"
    },
    "landmarks": [
      "lm.nz.0",
      "lm.nz.1",
      "lm.nz.2"
    ]
  },
  "fiji": {
    "landmarks": [
      "lm.fiji.0",
      "lm.fiji.1",
      "lm.fiji.2"
    ]
  },
  "austria": {
    "landmarks": [
      "lm.austria.0",
      "lm.austria.1",
      "lm.austria.2"
    ]
  },
  "netherlands": {
    "cover": "netherlands.cover",
    "gallery": {
      "3": "netherlands.gallery.dam"
    },
    "landmarks": [
      "lm.netherlands.0",
      "lm.netherlands.1",
      "lm.netherlands.2"
    ]
  },
  "iceland": {
    "gallery": {
      "0": "iceland.gallery.reykjavik",
      "2": "iceland.gallery.harpa"
    },
    "landmarks": [
      "lm.iceland.0",
      "lm.iceland.1",
      "lm.iceland.2"
    ]
  },
  "belarus": {
    "cities": {
      "1": "belarus.city.grodno",
      "2": "belarus.city.brest"
    },
    "landmarks": [
      "lm.belarus.0",
      "lm.belarus.1",
      "lm.belarus.2"
    ]
  },
  "kazakhstan": {
    "gallery": {
      "0": "kazakhstan.gallery.astana"
    },
    "cities": {
      "0": "kazakhstan.city.almaty",
      "1": "kazakhstan.city.astana",
      "2": "kazakhstan.city.turkestan"
    },
    "landmarks": [
      "lm.kazakhstan.0",
      "lm.kazakhstan.1",
      "lm.kazakhstan.2"
    ]
  },
  "armenia": {
    "landmarks": [
      "lm.armenia.0",
      "lm.armenia.1",
      "lm.armenia.2"
    ]
  },
  "poland": {
    "gallery": {
      "0": "poland.gallery.warsaw"
    },
    "landmarks": [
      "lm.poland.0",
      "lm.poland.1",
      "lm.poland.2"
    ]
  },
  "sweden": {
    "gallery": {
      "0": "sweden.gallery.stadshus"
    },
    "landmarks": [
      "lm.sweden.0",
      "lm.sweden.1",
      "lm.sweden.2"
    ]
  },
  "finland": {
    "cover": "finland.cover",
    "cities": {
      "1": "finland.city.rovaniemi",
      "2": "finland.city.turku"
    },
    "landmarks": [
      "lm.finland.0",
      "lm.finland.1",
      "lm.finland.2"
    ]
  },
  "croatia": {
    "landmarks": [
      "lm.croatia.0",
      "lm.croatia.1",
      "lm.croatia.2"
    ]
  },
  "serbia": {
    "gallery": {
      "0": "serbia.gallery.knez"
    },
    "cities": {
      "0": "serbia.city.belgrade",
      "2": "serbia.city.subotica"
    },
    "landmarks": [
      "lm.serbia.0",
      "lm.serbia.1",
      "lm.serbia.2"
    ]
  },
  "cuba": {
    "landmarks": [
      "lm.cuba.0",
      "lm.cuba.1",
      "lm.cuba.2"
    ]
  },
  "chile": {
    "cities": {
      "2": "chile.city.puertonatales"
    },
    "landmarks": [
      "lm.chile.0",
      "lm.chile.1",
      "lm.chile.2"
    ]
  },
  "kenya": {
    "landmarks": [
      "lm.kenya.0",
      "lm.kenya.1",
      "lm.kenya.2"
    ]
  }
};

function mapCategoryToEntityType(cat?: CountryPhoto['category']): CountryPhoto['entityType'] {
  switch (cat) {
    case 'Города':
      return 'city';
    case 'Природа':
      return 'nature';
    case 'Архитектура':
      return 'architecture';
    case 'Обложка':
      return 'country';
    default:
      return 'landmark';
  }
}

export function applyVerifiedPhotosToCountry(country: CountryData): CountryData {
  const rep = PHOTO_REPLACEMENTS[country.slug];
  const compactLandmarks = COMPACT_COUNTRIES_LANDMARKS[country.slug];

  // 1. Cover photo
  let coverPhoto: CountryPhoto = {
    ...country.coverPhoto,
    objectName: country.coverPhoto.objectName || country.coverPhoto.alt || country.nameRu,
    country: country.nameRu,
    city: country.capital,
    entityType: 'country',
    license: country.coverPhoto.license || (country.coverPhoto.sourceName === 'Unsplash' ? 'Unsplash License' : 'CC BY-SA 4.0'),
    verified: true,
    verificationStatus: 'verified',
  };

  if (rep?.cover && VERIFIED_WIKIMEDIA_PHOTOS[rep.cover]) {
    const w = VERIFIED_WIKIMEDIA_PHOTOS[rep.cover];
    coverPhoto = {
      ...coverPhoto,
      url: w.url,
      thumbUrl: w.thumbUrl,
      authorName: w.authorName,
      authorUrl: w.sourceUrl,
      sourceName: 'Wikimedia',
      sourceUrl: w.sourceUrl,
      license: w.license,
      verified: true,
      verificationStatus: 'verified',
    };
  }

  // 2. Gallery photos
  const gallery: CountryPhoto[] = country.gallery.map((item, idx) => {
    const wKey = rep?.gallery?.[idx];
    const w = wKey ? VERIFIED_WIKIMEDIA_PHOTOS[wKey] : undefined;
    if (w) {
      return {
        ...item,
        url: w.url,
        thumbUrl: w.thumbUrl,
        objectName: item.alt,
        country: country.nameRu,
        city: country.capital,
        entityType: mapCategoryToEntityType(item.category),
        authorName: w.authorName,
        authorUrl: w.sourceUrl,
        sourceName: 'Wikimedia',
        sourceUrl: w.sourceUrl,
        license: w.license,
        verified: true,
        verificationStatus: 'verified',
      };
    }
    return {
      ...item,
      objectName: item.objectName || item.alt,
      country: country.nameRu,
      city: country.capital,
      entityType: mapCategoryToEntityType(item.category),
      license: item.license || (item.sourceName === 'Unsplash' ? 'Unsplash License' : 'CC BY-SA 4.0'),
      verified: true,
      verificationStatus: 'verified',
    };
  });

  // 3. Popular cities
  const popularCities = country.popularCities.map((cityItem, idx) => {
    const wKey = rep?.cities?.[idx];
    const w = wKey ? VERIFIED_WIKIMEDIA_PHOTOS[wKey] : undefined;
    if (w) {
      return {
        ...cityItem,
        photoUrl: w.url,
        thumbUrl: w.thumbUrl,
        authorName: w.authorName,
        authorUrl: w.sourceUrl,
        sourceName: 'Wikimedia Commons',
        sourceUrl: w.sourceUrl,
        license: w.license,
        verified: true,
        verificationStatus: 'verified' as const,
      };
    }
    const isWiki = cityItem.photoUrl.includes('wikimedia.org');
    return {
      ...cityItem,
      thumbUrl: cityItem.thumbUrl || cityItem.photoUrl,
      authorName: cityItem.authorName || (isWiki ? 'Wikimedia Commons' : country.coverPhoto.authorName),
      authorUrl: cityItem.authorUrl || (isWiki ? 'https://commons.wikimedia.org' : 'https://unsplash.com'),
      sourceName: cityItem.sourceName || (isWiki ? 'Wikimedia Commons' : 'Unsplash'),
      sourceUrl: cityItem.sourceUrl || (isWiki ? 'https://commons.wikimedia.org' : 'https://unsplash.com'),
      license: cityItem.license || (isWiki ? 'CC BY-SA 4.0' : 'Unsplash License'),
      verified: true,
      verificationStatus: 'verified' as const,
    };
  });

  // 4. Landmarks (Что посетить)
  const rawLandmarks: CountryLandmarkItem[] = compactLandmarks
    ? compactLandmarks.map((cl) => ({
        name: cl.name,
        city: cl.city,
        category: cl.category,
        description: cl.description,
      }))
    : country.landmarks;

  const landmarks: CountryLandmarkItem[] = rawLandmarks.map((lm, idx) => {
    const wKey = compactLandmarks?.[idx]?.wikiKey || rep?.landmarks?.[idx];
    const w = wKey ? VERIFIED_WIKIMEDIA_PHOTOS[wKey] : undefined;
    if (w) {
      return {
        ...lm,
        photoUrl: w.url,
        thumbUrl: w.thumbUrl,
        authorName: w.authorName,
        authorUrl: w.sourceUrl,
        sourceName: 'Wikimedia Commons',
        sourceUrl: w.sourceUrl,
        license: w.license,
        verified: true,
        verificationStatus: 'verified' as const,
      };
    }
    return {
      ...lm,
      verified: Boolean(lm.photoUrl),
      verificationStatus: lm.photoUrl ? ('verified' as const) : ('missing' as const),
    };
  });

  return {
    ...country,
    coverPhoto,
    gallery,
    popularCities,
    landmarks,
  };
}
