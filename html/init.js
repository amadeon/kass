var WProp="Toolbar=0, Location=0, Directories=0, Status=0, Menubar=0, Scrollbars=0, Resizable=1, Copyhistory=0, Height=1, Width=1";

var KassaText="<HTML><BODY>"+
"<FORM method='POST' action='http://srv.ecolines.ru/cgi-bin/kkm/kassa.cgi' name='check'>"+
"<INPUT type='hidden' name='summ' value='"+summ+"'>"+
"<INPUT type='hidden' name='ticket' value='"+ticket+"'>"+
"<INPUT type='hidden' name='login' value='"+login+"'>"+
"<INPUT type='hidden' name='operator' value='"+operator+"'</FORM>"+
"</BODY></HTML>"+"<script language ='JavaScript'>check.submit();</script>";

KassaWin=window.open("","",WProp);
KassaWin.moveTo(350,300);
KassaWin.resizeTo(310,350);
KassaWin.document.open();
KassaWin.document.write(KassaText);
KassaWin.document.close();
