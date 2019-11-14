var PAGE_RIGHT = 1;
var PAGE_LEFT = 0;
var TABLE_COUNT = 2;
var tableNum = 1;

$('#t'+tableNum).show();
for(i=0; i<TABLE_COUNT; i++)
{
  $('.page-list').append('<li></li');
}
$('.page-list').children().eq(tableNum-1).css("background-color", "gray" );


function visibility(number)
{
  //PAGE_RIGHT or PAGE_LEFT
  var exNum = tableNum;
  if(number == PAGE_RIGHT)
    {
      tableNum++;
      if(tableNum>TABLE_COUNT){tableNum=TABLE_COUNT};
    }
  else
    {
      tableNum--;
      if(tableNum<1){tableNum=1;}
    }
    if(exNum != tableNum)
    {
      $('#t'+exNum).hide();
      $('#t'+tableNum).show();
      $('.page-list').children().eq(exNum-1).css("background-color", "white" );
      $('.page-list').children().eq(tableNum-1).css("background-color", "gray" );
    }
}
var onGetDevices = function(ports)
{
  for (var i=0; i<ports.length; i++)
  {
    console.log(ports[i].path);
    $('#ports').append('<option value="'+ports[i].path+'">'+ports[i].path+'</option>');
  }
}
chrome.serial.getDevices(onGetDevices);

var onConnect = function(connectionInfo)
{
   // The serial port has been opened. Save its id to use later.
  _this.connectionId = connectionInfo.connectionId;
  // Do whatever you need to do with the opened port.
}
// Connect to the serial port /dev/ttyS01
// chrome.serial.connect("COM3", {bitrate: 9600}, function(connectionInfo) {
//   $('#list').append('OK: CONNECTED'+connectionInfo.connectionId);
//   connectionId = connectionInfo.connectionId;});

var writeSerial=function(str)
{
  str+='\r\n';
  chrome.serial.send(connectionId, convertStringToArrayBuffer(str), function() {});
  $('#transmitted').prepend(str+'<br>');
}

// Convert string to ArrayBuffer
var convertStringToArrayBuffer=function(str)
{
  var buf=new ArrayBuffer(str.length);
  var bufView=new Uint8Array(buf);
  for (var i=0; i<str.length; i++)
  {
    bufView[i]=str.charCodeAt(i);
  }
  return buf;
}


function convertArrayBufferToString(buf){
  var bufView = new Uint8Array(buf);
  var encodedString = String.fromCharCode.apply(null, bufView);
  return decodeURIComponent(encodedString);
}

var stringReceived = '';
var onReceiveCallback = function(info)
{

    $('#rec').prepend(convertArrayBufferToString(info.data)+'<br>');
};

//chrome.serial.onReceive.addListener(onReceiveCallback);

var onDisconnect = function(result) {
  if (result) {
    $('#connect').html("Disconnected from the serial port<br>");
  } else {
    $('#connect').html("Disconnect failed<br>");
  }
  chrome.serial.onReceive.removeListener(onReceiveCallback);
}

function test(str) 
{
    $('#list').append("Test OK!<br>");
};

document.addEventListener('DOMContentLoaded', function() {
    var button1 = document.getElementById('button1');
    var close = document.getElementById('close');
    var clear = document.getElementById('clear');

    button1.addEventListener('click', function()
    {
      //Connect to the serial port /dev/ttyS01
      var port = document.getElementById('ports').value;
      var baudrate = parseInt(document.getElementById('baudrate').value, 10);
      var databits = document.getElementById('databits').value;
      var stopbits = document.getElementById('stopbits').value;
      var parity = document.getElementById('parity').value;
      var flowcontrol = document.getElementById('flowcontrol').value;
      if(flowcontrol > 0){flowcontrol = true}
        else{flowcontrol = false};
      console.log(port);
      console.log(baudrate);
      console.log(databits);
      console.log(stopbits);
      console.log(parity);
      console.log(flowcontrol);
      chrome.serial.connect(port, {bitrate: baudrate, dataBits: databits, stopBits: stopbits, parityBit: parity, ctsFlowControl: flowcontrol}, function(connectionInfo) {
     $('#connect').html('Connected '+connectionInfo.connectionId);
      connectionId = connectionInfo.connectionId;});
      chrome.serial.onReceive.addListener(onReceiveCallback);
    });

    close.addEventListener('click', function()
    {
        chrome.serial.disconnect(connectionId, onDisconnect);
    });

    clear.addEventListener('click', function()
      {
        $('#rec').html('');
        $('#transmitted').html('');
      });

    var button_send = document.getElementById('send');
    button_send.addEventListener('click',function(event){
      event.preventDefault();
      writeSerial(document.getElementById('send-data').value);
    });

    var buttons = document.getElementsByClassName('buttons');
    for(var i=0; i<buttons.length; i++)
    {
      buttons[i].addEventListener('click', function(event )
      {
          event.preventDefault();
          console.log(event.currentTarget.getAttribute('id'));
          writeSerial(event.currentTarget.getAttribute('id'));
      });
    }

    var buttons_param = document.getElementsByClassName('buttons-param');
    for(var i=0; i<buttons_param.length; i++)
    {
      buttons_param[i].addEventListener('click', function(event )
      {
          event.preventDefault();
          // console.log(event.currentTarget.getAttribute('id'));
          var param = document.getElementById('param-'+event.currentTarget.getAttribute('id')).value;
          console.log(event.currentTarget.getAttribute('id')+param);
          writeSerial(event.currentTarget.getAttribute('id')+param);
      });
    }

    var pleft = document.getElementById('pleft');
    pleft.addEventListener('click', function()
    {
      visibility(PAGE_LEFT);
      console.log('left');
    });

    var pright = document.getElementById('pright');
    pright.addEventListener('click', function()
    {
      visibility(PAGE_RIGHT);
      console.log('right');
    });

    var buttons_param_change = document.getElementsByClassName('param-change');
    for(var i=0; i<buttons_param_change.length; i++)
    {
      buttons_param_change[i].addEventListener('click', function(event)
      {
        event.preventDefault();
        event.currentTarget.parentNode.parentNode.children[1].firstElementChild.value = event.currentTarget.getAttribute('param');
        // console.log(event.currentTarget.getAttribute('param'));
      });
    }

    var buttons_param_select = document.getElementsByClassName('param-select');
    for(var i=0; i<buttons_param_select.length; i++)
    {
      buttons_param_select[i].addEventListener('change', function(event)
      {
        event.preventDefault();
        var param_array = event.currentTarget.parentNode.children;
        var param = param_array[0].value;
        for(var i=1; i<param_array.length; i++)
        {
          param += ','+param_array[i].value;
        }
        event.currentTarget.parentNode.parentNode.children[1].firstElementChild.value = param;
        console.log(event.currentTarget.parentNode.parentNode.children[1].firstElementChild.value);
      });
    }

});