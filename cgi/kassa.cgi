#!/usr/bin/perl

use POSIX;
use Time::Local;

# -----------------------------
my $KKMPass='32150';
# -----------------------------

# Parameters from method POST
my($query_string);
sysread(STDIN,$query_string,$ENV{'CONTENT_LENGTH'});

my @formfields=split(/&/,$query_string);
foreach (@formfields)
{
    my ($key, $value) = split(/=/,$_);
    $value=~s/\+/ /g;
    $value=~s/%([0-9A-H]{2})/pack('C',hex($1))/ge;
    $IN{$key}=$value;
}									    

# Variables from ecolines.lv JavaScript
my $ticket=$IN{'ticket'};
my $operator=$IN{'operator'};
my $summ=$IN{'summ'};
my $login=$IN{'login'};

# Delete spaces that comes from ecolines.lv system
# but don't touch 'operator' name
$ticket=~s|\s*||g;
$login=~s|\s*||g;
$summ=~s|\s*||g;
$summ=~s|,||; # comma ist shit!

# System time for logging
my $tim=localtime();
open (LOG, ">>./kkm.log") or die "$!";
print LOG "$tim login=$login  operator=$operator  ticket=$ticket  summ=$summ\n";
close (LOG);


# ----------------------HTML CODE BEGINS----------------------------------------------



print "Content-type: text/html\n\n";

print <<HTML__;
<HTML>

<HEAD>
<META http-equiv='Content-Type' content='text/html; charset=UTF-8'>
<TITLE>Электронная касса</TITLE>

<script language ='JavaScript' src='http://srv.ecolines.ru/kkm/kkmwindow.js'></script>
<script language ='JavaScript' src='http://srv.ecolines.ru/kkm/kkmfunc.js?v=8'></script>

<script language ='JavaScript'>

// variable to access KKM
var KKMPass="${KKMPass}";
// variables from ecolines.lv page
var operator="${operator}";
var ticket="${ticket}";
var summ="${summ}";
var login="${login}";

// Global to remember between func calls
var ClientSumm="";


function ReplaceBodyOnPrint()
{
    document.body.innerHTML="<TABLE width=90% align=center border=0 TopMargin=30pt bgcolor=#F0FFF0 height=170pt>"+
    "<TR><TD height=40pt valign=middle><FONT size=4pt>Подождите, печатается чек...</FONT>"+
    "<TR><TD valign=top ID='status_fld'> </TABLE>"+
    "<FORM name='repeater'>"+
    "<TABLE width=100% align=center TopMargin=0pt><TR>"+
    "<TD align=center><INPUT TYPE='button' VALUE='Повторить!' onClick='self.close();'>"+
    "<TD align=center><INPUT TYPE='button' VALUE='Закрыть' onClick='CloseMe();'>"+
    "</TABLE></FORM>";
}


function CheckIncome()
{
    if  ( ClientSumm.indexOf(".",ClientSumm.indexOf(".")+1)!=-1 ) 
    { 
	printStatus("<FONT color=red size=4pt>Много<BR>точек!</FONT>");
	document.Money.CashIncome.focus();
	return(false);
    }
    else
    { 
	var parts = ClientSumm.split (".");
	if (parts[1] && parts[1].length > 2) 
	{ 
	    printStatus("<FONT color=red size=4pt>Лишние<BR>копейки!</FONT>");
	    document.Money.CashIncome.focus();
	    return(false);
	}
	else 
	{ 
	    if (ClientSumm.length==0) { ClientSumm=0; }
	    if (parseFloat(ClientSumm)-summ < 0) 
	    {
		printStatus("<FONT color=red size=4pt>Мало<BR>денег!</FONT>");
		document.Money.CashIncome.focus();
                return(false);
	    }
	    else 
	    { 
		return(true);
	    } 
	}
    }
}

function PrintCheque()
{
    if(document.Money.isCashBack[0].checked==false &&
       document.Money.isCashBack[1].checked==false &&
       document.Money.isCashBack[2].checked==false){
    
        alert("Нужно выбрать кэш или карта!");
        return;
    }

    // без сдачи
    if (document.Money.isCashBack[0].checked==true)
    { 
	// fucking globals
	ClientSumm=0; 
	StartCheque(0); 
    }
    // со здачей-проверить достаточно ли денег
    else if (document.Money.isCashBack[1].checked==true)
    { 
	if ( CheckIncome() )
	{
	    // ClientSumm was set up by CalcDelivery
	    StartCheque(0); 
	}
    }
    // третье поле выбрано - оплата кредиткой
    else
    {
	ClientSumm=0; 
	// 1 - by credit card
	StartCheque(1); 
    }
}

function StartCheque(PayType)
{

    //Если все Ok сами закроем в конце.
    clearTimeout(TOCounter);

    // В документе только статус и кнопка повтора
    // Теперь могут вызываться функции
    // которые печатают статус
    ReplaceBodyOnPrint();
			
    // Наконец пробиваем чек
    if (KKMDoCheque(operator,KKMPass,ticket,summ,ClientSumm,PayType)) { CloseMe(); }

}


function PrintDelivery(deliv)
{
    if (deliv)	{ printStatus("Сдача:<BR><FONT size=4pt>"+deliv+"</FONT>"); }
    else	{ printStatus(""); }
}

function CalcDelivery()
{ 
    ClientSumm = document.Money.CashIncome.value; // save global
    var rdeliv=fn(ClientSumm-summ); // сдача
    if (rdeliv > 0) { PrintDelivery(rdeliv); } else { PrintDelivery(0); }
    ResetTimer();
}

function FieldView(flag)
{
    if(flag)
    {
        var HTM="Получено:<BR><INPUT type='text' size='8'"+
	" name='CashIncome' value='"+ClientSumm+"'"+
        " onkeypress='CheckNum();' onkeyup='CalcDelivery();'>";
        ElemPrint('dyn_place',HTM);
        document.Money.CashIncome.focus();
        CalcDelivery();
    }
    else
    {
        ElemPrint('dyn_place',"Клиент внес...");
        PrintDelivery(0);
        ResetTimer();
    }
}

</script>

</HEAD>





<BODY OnLoad='Start();' OnBeforeUnload='ifExit();' TopMargin=5pt>

<TABLE width=100% border=0 TopMargin=0pt bgcolor=#FFFFFF>
<TR><TD>
<FONT size=3pt>Оператор:&nbsp;&nbsp;</FONT>
<FONT size=3pt color=#FF8080><B>${operator}</B></FONT>
<TR><TD>
<FONT size=4pt>Продан билет &nbsp;&nbsp;</FONT>
<FONT size=3pt>&#8470;&nbsp;</FONT>
<FONT size=4pt color=green><B>${ticket}</B></FONT>
<TR><TD>
<FONT size=4pt>Стоимость: &nbsp;&nbsp;</FONT>
<FONT size=4pt color=green><B>${summ}</B></FONT>
</TABLE>


<FORM name='Money'>
<TABLE width=100% align=center border=0 TopMargin=0pt bgcolor=#F0FFF0>
<TR>
<TD width=35pt><INPUT type='radio' name='isCashBack' OnClick='FieldView(false);'></INPUT>
<TD width=*><FONT size=3pt>Без сдачи</FONT>
<TR>
<TD height=45pt><INPUT type='radio' name='isCashBack' OnClick='FieldView(true);'></INPUT>
<TD ID='dyn_place'>
<TD valign='top' ID='status_fld'>
<TR>
<TD width=35pt><INPUT type='radio' name='isCashBack' OnClick='FieldView(false);'></INPUT>
<TD width=*><FONT size=3pt>Кредиткой</FONT>
</TABLE>
<BR>
<TABLE width=100% align=center TopMargin=0pt><TR>
<TD align=center><INPUT TYPE='button' VALUE='Пробить чек' onClick='PrintCheque();'>
<TD align=center><INPUT TYPE='button' VALUE='Не нужен' onClick='CloseMe();'>
</TABLE>
</FORM>



</BODY>

</HTML>

HTML__



# ----------------------HTML CODE END------------------------------------------------
