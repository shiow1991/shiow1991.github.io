import csv
import json
def process_annual_import_export():
    annual_import_export = {}
    with open('data/working/annual_import_export.csv', 'rb') as f:
        reader = csv.reader(f)
        cnt = 0
        for row in reader:
            if cnt == 0:
                cnt += 1
                continue
            cnt+=1
            data = row
            if int(data[0]) in range(2005,2015):
                annual_import_export[int(data[0])] = {
                    "import": int(data[7].replace(",","")),
                    "export": int(data[4].replace(",",""))
                }

    with open('data/json/annual_export_import.json', 'w') as outfile:
        json.dump(annual_import_export,outfile,sort_keys=True,indent=4, separators=(',', ': '))


country_list = ["China","Canada","Mexico","South Afric","United King","Japan","Philippines"]
category_list = ["Foods","Energy","Industrial","Machinery","Household"]
def process_coutry():
    annual_data_for_country = {}
    with open('data/working/export_by_goods_and_country.csv', 'rb') as f:
        reader = csv.reader(f)
        head = True
        coutry = set()
        for row in reader:
            if head:
                head = False
                continue
            coutry = row[1]
            if coutry in country_list:
                year = int(row[5])
                goods = row[3]
                amount = int(row[4])
                category = ""
                if goods in ["Wheat","Rice","Soybeans","Corn",
                    "Dairy products and eggs","Vegetables","Wine, beer, and related products","Fish and shellfish"]:
                    category = "Foods"
                elif goods in ["Fuel oil","Liquefied petroleum gases","Coal and related fuels","Gas-natural",\
                "Nuclear fuel materials","Electric energy"]:
                    category = "Energy"
                elif goods in ["Aluminum and alumina","Copper","Nonmonetary gold","Finished metal shapes","Pulpwood and woodpulp","Newsprint","Chemicals-organic"]:
                    category = "Industrial"
                elif goods in ["Electric apparatus","Drilling & oilfield equipment","Excavating machinery","Industrial engines","Metalworking machine tools","Materials handling equipment"]:
                    category = "Machinery"
                elif goods in ["Household appliances","Rugs","Cell phones and other household goods","Pleasure boats and motors","Televisions and video equipment","Recorded media"]:
                    category = "Household"

                if category:
                    annual_data_for_coutry.setdefault(year,{}).setdefault(coutry,{}).setdefault(category,{}).setdefault(goods,{})["export"] = amount


    with open('data/working/import_by_goods_and_country.csv', 'rb') as f:
            reader = csv.reader(f)
            head = True
            coutry = set()
            for row in reader:
                if head:
                    head = False
                    continue
                coutry = row[1]
                if coutry in country_list:
                    year = int(row[5])
                    goods = row[3]
                    amount = int(row[4])
                    category = ""
                    if goods in ["Wheat","Rice","Soybeans","Corn",
                        "Dairy products and eggs","Vegetables","Wine, beer, and related products","Fish and shellfish"]:
                        category = "Foods"
                    elif goods in ["Fuel oil","Liquefied petroleum gases","Coal and related fuels","Gas-natural",\
                    "Nuclear fuel materials","Electric energy"]:
                        category = "Energy"
                    elif goods in ["Aluminum and alumina","Copper","Nonmonetary gold","Finished metal shapes","Pulpwood and woodpulp","Newsprint","Chemicals-organic"]:
                        category = "Industrial"
                    elif goods in ["Electric apparatus","Drilling & oilfield equipment","Excavating machinery","Industrial engines","Metalworking machine tools","Materials handling equipment"]:
                        category = "Machinery"
                    elif goods in ["Household appliances","Rugs","Cell phones and other household goods","Cell phones and other household goods","Pleasure boats and motors","Televisions and video equipment","Recorded media"]:
                        category = "Household"

                    if category:
                        annual_data_for_coutry.setdefault(year,{}).setdefault(coutry,{}).setdefault(category,{}).setdefault(goods,{})["import"] = amount

    for year in range(2005,2015):
        for coutry in country_list:
            for category in category_list:
                cdata = annual_data_for_coutry[year][coutry][category]
                #print cdata
                import_total = export_total = 0
                for k,v in cdata.items():
                    v["total"] = int(v.get("import",0))+int(v.get("export",0))
                    import_total += int(v.get("import",0))
                    export_total += int(v.get("export",0))

                cdata["total"] = {
                    "import":import_total,
                    "export":export_total,
                }

                #print cdata

    with open('data/json/annual_data_for_country.json', 'w') as outfile:
        json.dump(annual_data_for_coutry,outfile,sort_keys=True,indent=4, separators=(',', ': '))


process_annual_import_export()
process_country()

