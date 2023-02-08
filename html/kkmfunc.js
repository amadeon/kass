var ECR;

function ConnectMakeECR()
{
    // создаем объект драйвера
    ECR = new ActiveXObject ("AddIn.FPrnM45");

    // занимаем порт
    ECR.DeviceEnabled = 1;
      
    // Чет не то
    if (ECR.GetStatus() != 0)
    {
    // далее везде вместо обработки ошибки просто отключаемся от ККМ...
        ECR.DeviceEnabled = 0;
	printStatus('Ошибка подключения ( '+ECR.GetLastError()+' )<BR><BR>Возможно занято другим приложением!');
	return(false);
    }
    return(true);
}


function RegisterCheque(KKMPass,Summ,TicketString)
{

    // входим в режим регистрации
    ECR.Password = KKMPass;
    ECR.Mode = 1;
    if (ECR.SetMode() != 0)
    {
	ECR.DeviceEnabled = 0;
	printStatus('Ошибка установки режима регистрации продажи ( '+ECR.GetLastError()+' )');
	return(false);
    }

// Применяемая система налогооблажения в чеке:ОСН - 1;УСН доход - 2;УСН доход-расход - 4;ЕНВД - 8;ЕСН - 16;ПСН - 32;
//ECR.AttrNumber=1055;
//ECR.AttrValue=СистемаНалогообложения;
//ECR.WriteAttribute();


    // регистрация продажи
    ECR.Name = TicketString;
    ECR.Price = Summ;
    ECR.Quantity = 1;
    //type1 = 0% NDS, type0 = from section
    //5 норм на подъездном, но дает 10/100 обвод
    //ECR.TaxTypeNumber = 5;
    //ECR.Tax = 5;
    //0 means that department is set to 1 but it is not printed on check
    //ECR.Department = 0;
    ECR.TaxTypeNumber = 0; //налог брать из таблицы секций
    ECR.Tax = 0;
    ECR.Department = 1; //возможно в явно виде первый отдел сработает по таблице налогов
    if (ECR.Registration() != 0)
    {
	ECR.DeviceEnabled = 0;
	printStatus('Ошибка регистрации продажи ( '+ECR.GetLastError()+' )');
	return(false);
    }
    
    return(true);
}


function CloseCheque(ClientSumm,PayType)
{
	//тип оплаты: 0 - наличные, 1 - кредит
	
        // закрытие чека наличными со сдачей,
	// если ECR.Summ совпадает с ECR.Price
	// т.к. у нас ECR.Quantity = 1 всегда
        ECR.Summ = ClientSumm;
        ECR.TypeClose = PayType;
        if (ECR.Delivery() != 0)
	//if (ECR.CancelCheck() != 0)
        {
            ECR.DeviceEnabled = 0;
            printStatus('Ошибка закрытия чека ( '+ECR.GetLastError()+' )');
            return(false);
        }
        else
        {
            // освобождаем порт
            ECR.DeviceEnabled = 0;
            return(true);
	}
}


function KKMDoCheque(OperatorName,KKMPass,TicketNum,Summ,ClientSumm,PayType)
{ 

    // На всякий случай
    KKMPass=parseInt(KKMPass);
//    TicketNum=parseInt(TicketNum);
    Summ=parseFloat(Summ);
    ClientSumm=parseFloat(ClientSumm);
    
//    mess=OperatorName+'   '+KKMPass+'  '+TicketNum+'  '+Summ+'  '+ClientSumm;
//    alert(mess);
//    alert(OperatorName.length);
//    return;
    
    TicketString=" Билет № "+TicketNum;

    
    // создаем объект и включаем
    if (!ConnectMakeECR()) { return(false); }


    // если есть открытый чек, то отменяем его
    if (ECR.CheckState != 0)
	if (ECR.CancelCheck() != 0)
        {
    	    ECR.DeviceEnabled = 0;
    	    printStatus('Ошибка отмены предыдущего чека ( '+ECR.GetLastError()+' )');
	    return(false);
        }

    if(OperatorName.length>0)
    {
	// Печатаем имя оператора
	//ECR.Caption=OperatorName;
	// На ЧЛ и КЛ
	//ECR.PrintPurpose=3;
	//ECR.Alignment=0;
	//ECR.PrintField();

	//ECR.Caption="~~~~~~~~~~~~~~~~~~~~";
	// На ЧЛ
	//ECR.PrintPurpose=1;
	//ECR.Alignment=0;
	//ECR.PrintField();

	//имя кассира через регистр 1021
	ECR.AttrNumber = 1021;
	ECR.AttrValue = OperatorName;
	ECR.WriteAttribute();

	//инн кассира тоже можно
	//ECR.AttrNumber = 1203;
	//ECR.AttrValue = OperatorINN;
	//ECR.WriteAttribute();
    }

    // Регистрируем сумму билета в ККМ
    if(!RegisterCheque(KKMPass,Summ,TicketString)) { return(false); }

    // Закрываем чек внесенной клиентом суммой
    if ( ClientSumm==0 )
    {
	// закрытие чека наличными без ввода полученной от клиента суммы
	// или кредиткой, если PayType = 1
        if(!CloseCheque(Summ,PayType)) { return(false); } else { return(true); }
    }
    else
    {
        // закрытие чека наличными со сдачей
        if(!CloseCheque(ClientSumm,0)) { return(false); } else { return(true); }
    }
}
