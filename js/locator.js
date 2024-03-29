﻿/** @license
 | Version 10.1.1
 | Copyright 2012 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

//function to locate address
function LocateAddress() {
    ShowProgressIndicator();
    if (dojo.byId("txtAddress").value.trim() == '') {
        HideProgressIndicator();
        alert(messages.getElementsByTagName("addressToLocate")[0].childNodes[0].nodeValue);
        dojo.byId('txtAddress').value = "";
        dojo.byId('txtAddress').focus();
        return;
    }
    var address = [];
    address[locatorFields[0]] = dojo.byId('txtAddress').value;
    var locator = new esri.tasks.Locator(locatorURL); //Variable for storing Locator service
    locator.outSpatialReference = map.spatialReference;
    locator.addressToLocations(address, ["Loc_name"], function (candidates) {
        ShowLocatedAddress(candidates);
    },
    function (err) {
        HideProgressIndicator();
        dojo.byId('txtAddress').value = "";
        dojo.byId('txtAddress').focus();
        mapPoint = null;
        alert(messages.getElementsByTagName("unableToLocate")[0].childNodes[0].nodeValue);
    });
}

//function to populate address
function ShowLocatedAddress(candidates) {
    map.infoWindow.hide();
    RemoveChildren(dojo.byId('tblAddressResults'));
    CreateScrollbar(dojo.byId("divAddressScrollContainer"), dojo.byId("divAddressScrollContent"));
    if (candidates.length > 0) {
        if (candidates[0].score == 100) {
            HideProgressIndicator();
            HideAddressContainer();
            dojo.byId('txtAddress').setAttribute("defaultAddress", candidates[0].address);
            mapPoint = new esri.geometry.Point(candidates[0].location.x, candidates[0].location.y, map.spatialReference);
            LocateAddressOnMap(mapPoint);
            return;
        }
        else {
            var table = dojo.byId("tblAddressResults");
            var tBody = document.createElement("tbody");
            table.appendChild(tBody);
            table.cellSpacing = 0;
            table.cellPadding = 0;
            for (var i = 0; i < candidates.length; i++) {
                var candidate = candidates[i];
                var tr = document.createElement("tr");
                tBody.appendChild(tr);
                var td1 = document.createElement("td");
                td1.innerHTML = candidate.address;
                td1.align = "left";
                td1.className = 'bottomborder';
                td1.style.cursor = "pointer";
                td1.height = 20;
                td1.setAttribute("x", candidate.location.x);
                td1.setAttribute("y", candidate.location.y);
                td1.setAttribute("address", candidate.address);
                td1.onclick = function () {
                    dojo.byId("txtAddress").value = this.innerHTML;
                    mapPoint = new esri.geometry.Point(this.getAttribute("x"), this.getAttribute("y"), map.spatialReference);
                    LocateAddressOnMap(mapPoint);
                }
                tr.appendChild(td1);
            }
            HideProgressIndicator();
            SetAddressResultsHeight();
        }
    }
    else {
        HideProgressIndicator();
        dojo.byId('txtAddress').focus();
        mapPoint = null;
        map.getLayer(tempGraphicsLayerId).clear();
        alert(messages.getElementsByTagName("unableToLocateAddress")[0].childNodes[0].nodeValue);
    }
}

//Function for sorting comments according to value
function SortResultFeatures(a, b) {
    var x = a.y;
    var y = b.y;
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
}

//function to locate address on map
function LocateAddressOnMap(mapPoint)
{
    selectedMapPoint = null;
    map.infoWindow.hide();
    ClearGraphics();
    for (var bMap = 0; bMap < baseMapLayers.length; bMap++) {
        if (map.getLayer(baseMapLayers[bMap].Key).visible) {
            var bmap = baseMapLayers[bMap].Key;
        }
    }
    if (!map.getLayer(bmap).fullExtent.contains(mapPoint)) {
        map.infoWindow.hide();
        selectedMapPoint = null;
        mapPoint = null;
        map.getLayer(tempGraphicsLayerId).clear();
        HideProgressIndicator();
        HideAddressContainer();
        alert(messages.getElementsByTagName("noDataAvlbl")[0].childNodes[0].nodeValue);
        return;
    }
    if (mapPoint)
    {
        var ext = GetExtent(mapPoint);
        map.setExtent(ext.getExtent().expand(2));
            var graphic = new esri.Graphic(mapPoint, locatorMarkupSymbol, { "Locator": true }, null);
            map.getLayer(tempGraphicsLayerId).add(graphic);

    }
        HideAddressContainer();
}

//function to get the extent based on the mappoint
function GetExtent(point) {
    var xmin = point.x;
    var ymin = (point.y) - 30;
    var xmax = point.x;
    var ymax = point.y;
    return new esri.geometry.Extent(xmin, ymin, xmax, ymax, map.spatialReference);
}