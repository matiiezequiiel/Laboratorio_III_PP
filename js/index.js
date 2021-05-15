var request     = new XMLHttpRequest();
window.onload   = loadEvents;
var controller;

function startedGIF(myState) 
{
    var spinner     = document.getElementById("bodyDiv");
    spinner.hidden  = myState;
}

function isDate(date) 
{
    var today   = new Date();
    var dateAux = new Date();
    var aux     = date.split('-');
    
    dateAux.setFullYear(aux[0], aux[1]-1, aux[2]);
    
    if(dateAux <= today)
    {
        return false;
    }
    else
    {
        return true;
    }
}

function callback() 
{

    if (request.readyState === 4) 
    {
        if (request.status === 200) 
        {
            var matJSON     = JSON.parse(request.responseText);
            var tbodyObject = document.getElementById("tableBody");

            matJSON.forEach(m => {
                var tr = document.createElement('tr');
                tr.addEventListener('dblclick', fnOpen);
                tbodyObject.appendChild(tr);
                tr.appendChild(fnNewTD(m.id));
                tr.appendChild(fnNewTD(m.nombre));
                tr.appendChild(fnNewTD(m.cuatrimestre));
                tr.appendChild(fnNewTD(m.fechaFinal));
                tr.appendChild(fnNewTD(m.turno));
            });
        }
    }
}

function loadEvents() 
{
    fnGet("btnClose").addEventListener("click", fnClose);
    fnGet('btnSave').addEventListener("click", fnModificate);
    fnGet('btnDelete').addEventListener("click", fnDelete);
    loadTable();
}

function loadTable() 
{
    request.open("GET", "http://localhost:3000/materias", true);
    request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    request.onreadystatechange = callback;
    request.send();
}

function fnOpen(mivar) 
{
    var $dataBody   = fnGet("dataBody");

    controller      = mivar.srcElement.parentNode;
    started         = mivar.srcElement.parentNode.firstChild;

    fnGet('hiddenID').value                 = started.innerHTML;
    fnGet('txtName').value                  = started.nextSibling.innerHTML;
    fnGet('impCuatrimestre').selectedIndex  = parseInt(started.nextSibling.nextSibling.innerHTML) - 1;
    fnGet('impCuatrimestre').disabled       = true;

    var turn = started.nextSibling.nextSibling.nextSibling.nextSibling.innerHTML;

    if (turn === "Mañana") 
    {
        fnGet('impTM').checked = true;
    }
    else 
    {
        fnGet('impTN').checked = true;
    }

    var date                = started.nextSibling.nextSibling.nextSibling.innerHTML;
    var newDate             = date.split('/');

    fnGet('impDate').value  = newDate[2] + "-" + newDate[1] + "-" + newDate[0];

    $dataBody.hidden = false;
}

function fnClose() 
{
    var $dataBody = fnGet("dataBody");
    $dataBody.hidden = true;
}

function fnGet(varId) 
{
    return document.getElementById(varId);
}

function fnNewTD(varData) 
{
    var td = document.createElement('td');
    var text = document.createTextNode(varData);
    td.appendChild(text);

    return td;
}

function fnModificate() 
{

    var txtName = fnGet('txtName').value;
    var txtCuatrimestre = fnGet('impCuatrimestre').value;
    var date = fnGet('impDate').value;
    var impTM = fnGet('impTM').checked;
    var impTN = fnGet('impTN').checked;
    var idMat = parseInt(fnGet('hiddenID').value);
    var turn = "Mañana";

    document.getElementById("txtName").classList.remove('error');
    document.getElementById("impDate").classList.remove("error");

    if (impTM === false) 
    {
        turn == "Noche";
    }

    var myDate = date.split('-');
    var newDate = myDate[2] + "/" + myDate[1] + "/" + myDate[0];


    if (isDate(date) === false) 
    {
        document.getElementById("impDate").className = "error";
        return;
    }

    if ((txtName.length < 6) || txtName.value == "") 
    {
        document.getElementById("txtName").className = "error";
        return;
    }

    if (impTM == false && impTN == false) 
    {
        document.getElementById("txtName").className = "error";
        return;
    }


    startedGIF(false);

    var myJSON =
    {
        id: idMat,
        nombre: txtName,
        cuatrimestre: parseInt(txtCuatrimestre) + 1,
        fechaFinal: newDate, turno: turn
    }

    var newJSON = JSON.stringify(myJSON);
    request.open("POST", "http://localhost:3000/editar", true);
    request.onreadystatechange = callModificate;
    request.setRequestHeader("Content-type", "application/json");
    request.send(newJSON);
}

function fnDelete() 
{
    startedGIF(false);

    var id      = fnGet('hiddenID').value;
    var myJSON  = { id: id }
    var exit    = JSON.stringify(myJSON);

    request.open("POST", "http://localhost:3000/eliminar", true);
    request.onreadystatechange = callDelete;
    request.setRequestHeader("Content-type", "application/json");
    request.send(exit);
}

function callModificate() 
{
    if (request.readyState === 4) 
    {
        if (request.status === 200) 
        {
            startedGIF(true);
            var children            = controller.children;
            children[1].innerHTML   = fnGet('txtName').value;

            var date                = fnGet('impDate').value;
            var myDate              = date.split('-');
            var newDate             = myDate[2] + "/" + myDate[1] + "/" + myDate[0];
            children[3].innerHTML   = newDate;

            if (fnGet('impTM').checked)
            {
                children[4].innerHTML = "Mañana";
            }
            else
            {
                children[4].innerHTML = "Noche";
            }

            fnClose();
        }
    }
}


function callDelete() 
{
    if (request.readyState === 4) 
    {
        if (request.status === 200) 
        {
            startedGIF(true);
            controller.parentNode.removeChild(controller);
            fnClose();
        }
    }
}