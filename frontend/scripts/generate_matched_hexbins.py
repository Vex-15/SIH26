import json
import h3
from collections import defaultdict
import os

input_file = '../public/data/india_hotspots_precision_points.geojson'
output_file = '../public/data/india_matched_hexbins.geojson'

# Ensure the output directory exists
os.makedirs(os.path.dirname(output_file), exist_ok=True)

with open(input_file, 'r') as f:
    data = json.load(f)

H3_RESOLUTION = 7
hex_groups = defaultdict(list)

for feat in data['features']:
    coords = feat['geometry']['coordinates']
    lon, lat = coords[0], coords[1]
    
    try:
        cell = h3.latlng_to_cell(lat, lon, H3_RESOLUTION)
    except AttributeError:
        cell = h3.geo_to_h3(lat, lon, H3_RESOLUTION)
        
    hex_groups[cell].append(feat['properties'])

output_features = []

for cell, props_list in hex_groups.items():
    try:
        boundary = h3.cell_to_boundary(cell)
    except AttributeError:
        boundary = h3.h3_to_geo_boundary(cell)
        
    poly_coords = [[lon, lat] for lat, lon in boundary]
    poly_coords.append(poly_coords[0])
    
    count = len(props_list)
    
    w_c = sum(1 for p in props_list if p.get('cls') == 0)
    a_c = sum(1 for p in props_list if p.get('cls') == 1)
    i_c = sum(1 for p in props_list if p.get('cls') == 2)
    fl_c = sum(1 for p in props_list if p.get('cls') == 3)
    ac_c = sum(1 for p in props_list if p.get('cls') == 4)
    
    class_counts = {0: w_c, 1: a_c, 2: i_c, 3: fl_c, 4: ac_c}
    primary_cls = max(class_counts, key=class_counts.get)
    
    f_vals = [p.get('frp', 0) for p in props_list]
    b_vals = [p.get('brightness', 330) for p in props_list]
    n_vals = [p.get('no2', 0) for p in props_list]
    s_vals = [p.get('so2', 0) for p in props_list]
    
    lc = 40
    ind_r = i_c / count if count > 0 else 0
    
    elev_vals = [p.get('elevation', 0) for p in props_list]
    elev_avg = sum(elev_vals) / count if count > 0 else 0

    feature = {
        "type": "Feature",
        "id": cell,
        "geometry": {
            "type": "Polygon",
            "coordinates": [poly_coords]
        },
        "properties": {
            "hex_id": cell,
            "count": count,
            "cls": primary_cls,
            "w_c": w_c,
            "a_c": a_c,
            "i_c": i_c,
            "fl_c": fl_c,
            "ac_c": ac_c,
            "f_m": sum(f_vals)/count if count>0 else 0,
            "f_x": max(f_vals) if f_vals else 0,
            "b_m": sum(b_vals)/count if count>0 else 0,
            "b_x": max(b_vals) if b_vals else 0,
            "n_m": sum(n_vals)/count if count>0 else 0,
            "s_m": sum(s_vals)/count if count>0 else 0,
            "elev": elev_avg,
            "lc": lc,
            "ind_r": ind_r
        }
    }
    output_features.append(feature)

out_geojson = {
    "type": "FeatureCollection",
    "features": output_features
}

with open(output_file, 'w') as f:
    json.dump(out_geojson, f, separators=(',', ':'))

print(f"Aggregated {len(data['features'])} points into {len(output_features)} exact 1:1 H3 hexbins.")
