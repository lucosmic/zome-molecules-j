// biochem-listing.js
import { BIO_models } from './models-biochemistry-r3.js';
import { MM1_models } from './models-MolecularMania-r2.js';

const models_combined = MM1_models.concat(BIO_models);//{ ...MM1_models, ...BIO_models};//Object.assign({}, BIO_models, MM1_models);
const table = document.getElementById("partsTable");
const tbody = table.createTBody();
const viewer = document.getElementById("viewer");
const showRgroup = document.getElementById("showRgroup");
const zomeSwitch = document.getElementById( "zome-switch" );
const indexModel = document.getElementById("model-index");
let selectedRow = null;

let hasInitialized = false;
function initializeApp() {
	if (hasInitialized) {
		console.log("App already initialized..");
		return
	}
	
	for (const model of models_combined) {
		const tr = tbody.insertRow();
		fillRow(tr, model);
		tr.addEventListener("click", () => selectModel(model, tr));
	}
	/*
	for (const model of BIO_models) {
		const tr = tbody.insertRow();
		fillRow(tr, model);
		tr.addEventListener("click", () => selectModel(model, tr));
	}*/
	let initialId = 2;
	const initialRow = tbody.rows[initialId];
	selectModel(models_combined[initialId], initialRow);
	console.log("App initialized!");
	hasInitialized = true;
}

initializeApp();


function fillRow(tr, model) {
  const { form_ansi, name, category, mass } = model;
  tr.dataset.url = model.url;
  tr.dataset.scene = name;

  if("molec_type" in model) {
	//Biochem (Amino Acid)
	tr.dataset.rgroupscene = model.molec_type === 'AA-R' ? `${name} R-group` : "";
	tr.classList.add("molec-" +  model.molec_type.substring(0,2).toLowerCase() );
  } else {
	//doesn't have a molecule type. May be a Molecular Mania model instead of Biochem. 
	tr.dataset.rgroupscene = "";
	tr.classList.add("molec-mm");
  }

  let td = tr.insertCell();
  td.className = "ident done";
  if("abbrev_three" in model) {
	td.textContent = model.abbrev_three;
  } else {
	//doesn't have a TLA. May be a Molecular Mania model instead of Biochem.
	td.textContent = model.id;
  }
  

  td = tr.insertCell();
  td.className = "molec-mass";
  td.textContent = mass;

  

  td = tr.insertCell();
  td.className = "title";
  td.textContent = name;

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
  td.className = "category";
  if("molec_type" in model) {
	//Biochem cards
  	td.textContent = model.molec_type + " - " + category;
  } else if ("poly" in model) {
	//Molecular Modeling cards
	td.textContent = category + ( (model.poly.length > 2) ? " - " + model.poly : "");
  } else {
	td.textContent = category;
  }
}

function selectModel(model, tr) {
  if (selectedRow) selectedRow.classList.remove("selected");
  selectedRow = tr;
  selectedRow.classList.add("selected");
  indexModel.textContent = model.name;

  console.log(`Trying to load model ${model.url} ...`)
  viewer.src = model.url;
  
  setScene(tr.dataset);
}

showRgroup.addEventListener("change", () => {
  if (selectedRow) setScene(selectedRow.dataset);
});

viewer .addEventListener( "vzome-scenes-discovered", (e) => {
  // Logging this to the console for now. Not actually using the scenes list.
  const scenes = e.detail;
  console.log( "These scenes were discovered in " + viewer.src);
  console.log( JSON.stringify( scenes, null, 2 ) );
  //Now that scenes are discovered, update viewer. Again.
  console.log("Update viewer after scene load...");
  viewer.update();
} );


function setScene(data) {
	

	var scene = showRgroup.checked && data.rgroupscene ? data.rgroupscene : data.scene;
	
	zomeSwitch.className = (data.rgroupscene.length > 2) ? 'rgrp' : 'no-rgrp';

	console.log(`Trying to load scene ${scene} ...`);
	viewer.scene = scene;

	
	console.log("Update viewer...");
	try {
		viewer.update();
	} catch (Error) {
		console.log("Likely no .scenes.json file..")
	}
  	
}
