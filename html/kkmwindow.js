// kill exit flag
var kill=false;
// timeout counter
var TOCounter;



// Запускается при загрузке тела
function Start() { SetTimeout(); FieldView(false); }

// ask after timeout
function ask()
{ 
    top.window.focus();
    if(confirm("Минута прошла! :)\nЗакрыть окно кассы?"))  { CloseMe(); } else { SetTimeout(); } 
}

// idle timer
function SetTimeout()
{ TOCounter=window.setTimeout('ask()',60000); }

// count begin from the beginning
function ResetTimer()
{ clearTimeout(TOCounter); SetTimeout(); }

// close window without ask
function CloseMe()
{ kill=true; self.close(); }

// По крестику выводим окно
// По closeme() не выводим
function ifExit()
{   
    if (!kill) 
    { 
	// Мы можем сами открыть себя, как в скрипте, общем с ecolines.lv
	var WProp="Toolbar=0, Location=0, Directories=0, Status=0, Menubar=0, Scrollbars=0, Resizable=0, Copyhistory=0, Height=1, Width=1";
	
	var KassaText="<HTML><BODY>"+
	"<FORM method='POST' action='http://srv.ecolines.ru/cgi-bin/kkm/kassa.cgi' name='check'>"+
	"<INPUT type='hidden' name='summ' value='"+summ+"'>"+
	"<INPUT type='hidden' name='ticket' value='"+ticket+"'>"+
	"<INPUT type='hidden' name='login' value='"+login+"'>"+
	"<INPUT type='hidden' name='operator' value='"+operator+"'</FORM>"+
	"</BODY></HTML>"+"<script language ='JavaScript'>check.submit();</script>";
	
	KassaWin=window.open("","",WProp);
	KassaWin.moveTo(250,250);
	KassaWin.resizeTo(310,300);
	KassaWin.document.open();
	KassaWin.document.write(KassaText);
	KassaWin.document.close();
		
	//event.returnValue = 'НАЖМИТЕ КНОПКУ [Отмена], ЧТОБЫ ОСТАВИТЬ ЭТО ОКНО!'; 
    } 
}

// печать в выбранный элемент
function ElemPrint(elem,words)
{
    var elem=document.all(elem);
    if (words)  { elem.innerHTML=words; }
    else        { elem.innerHTML=""; }
}

// печать в элемент статуса
function printStatus(status) { ElemPrint('status_fld',status); }



// Точки запятые по барабану
// и кроме этого-цифры и все.
function CheckNum()
{
    if (! ((event.keyCode>47) && (event.keyCode<58) || (event.keyCode==44) || (event.keyCode==46)) )
    { event.returnValue = false; }
    else   { if (event.keyCode==44) { event.keyCode=46; } }
}

// округление копейков
function fn(n)
{
    return Math.round(n*100)/100;
}
