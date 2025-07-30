// biochem-listing.js
import { models } from './biochemistry-models-r2.js';

const table = document.getElementById("partsTable");
const tbody = table.createTBody();
const viewer = document.getElementById("viewer");
const showEdges = document.getElementById("showEdges");
const zomeSwitch = document.getElementById( "zome-switch" );
const indexModel = document.getElementById("model-index");
let selectedRow = null;

for (const model of models) {
  const tr = tbody.insertRow();
  fillRow(tr, model);
  tr.addEventListener("click", () => selectModel(model, tr));
}
var initialId = 1;
const initialRow = tbody.rows[initialId]
selectModel(models[initialId], initialRow)

function fillRow(tr, model) {
  const { id, form_ansi, name, molec_type, category } = model;
  tr.dataset.url = model.url;
  tr.dataset.scene = name;
  tr.dataset.rgroupscene = molec_type === 'AA-R' ? `${name} R-group` : "";

  tr.classList.add("molec-" +  molec_type.substring(0,2).toLowerCase() );

  let td = tr.insertCell();
  td.className = "ident done";
  td.textContent = id;

  td = tr.insertCell();
  td.className = "molec-form";
  //td.innerHTML = form_ansi.replace(/([0-9]+)/g, '<sub>$1</sub>');
  let formula = form_ansi;
  const iIndex = formula.indexOf('i');
  if (iIndex !== -1) {
    const base = formula.substring(0, iIndex).replace(/([0-9]+)/g, '<sub>$1</sub>');
    const charge = formula.substring(iIndex + 1);
    formula = `${base}<sup>${charge}</sup>`;
  } else {
    formula = formula.replace(/([0-9]+)/g, '<sub>$1</sub>');
  }
  td.innerHTML = formula;

  td = tr.insertCell();
  td.className = "title";
  td.textContent = name;

  td = tr.insertCell();
  td.className = "category";
  td.textContent = molec_type + " - " + category;
}

function selectModel(model, tr) {
  if (selectedRow) selectedRow.classList.remove("selected");
  selectedRow = tr;
  selectedRow.classList.add("selected");
  indexModel.textContent = model.name;
  viewer.src = model.url;
  setScene(tr.dataset);
}

showEdges.addEventListener("change", () => {
  if (selectedRow) setScene(selectedRow.dataset);
});

viewer .addEventListener( "vzome-scenes-discovered", (e) => {
  // Just logging this to the console for now. Not actually using the scenes list.
  const scenes = e.detail;
  //console.log( "These scenes were discovered in " + viewer.src);
  console.log( JSON.stringify( scenes, null, 2 ) );
} );


function setScene(data) {
  
	const scene = showEdges.checked && data.rgroupscene ? data.rgroupscene : data.scene;
	
	zomeSwitch.className = (data.rgroupscene.length > 2) ? 'rgrp' : 'no-rgrp';
	viewer.scene = scene;

  	viewer.update();
}
