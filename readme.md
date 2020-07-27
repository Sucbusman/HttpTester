# HttpTester

Similar to and inspired by hackbar,but gives new features listed below so that it can be used for broader purpose.

## Install

You can install it from mozila addons market(https://addons.mozilla.org/en-US/firefox/addon/httptester/).

## Features

*Packet logging*

+ It can capture packets and displayed,you can select one and load data from it instead of manually typing.

*Give more detail*

+ This tool show packets in raw form,so you won't missing something important.

*Custumize your own tools*

+ You can add your own scripts to meets your desire.

*Persistance*

+ You can save the current working packet to disk and reload it to work area when needed

*Generate python code*

+ You can generate python code from current selected packet

*Malform payload support*

+ Sometiems you want to break the http rules to send unformal packets to see what happend.

*Native and clean*
+ Writen in native js with none thrid party code,free as free bear.

## Quick Start

1. Acess a Web page,press F12 or Ctrl-Shift-C to open develop-tool panel,swicth to this tool and do some interaction with the remote or simply press Ctrl-R to fresh the page.

2. When browser finished receive data from the remote, packets will available to this tool.Click "Packet" button and the request info of the first packet will automatically load to your work area.

3. You can select arbitary packet and click below blank area to show response detail.

4. Modify request header and body freely and manually or use your function scripts and click "Exec" button to send. 

5. The server's response header and body will displayed below.

## Q&A 

Q1. What is ajax-fake-content technique?
> Send  data  in plain-text using XMLHttpRequest but modify Content-Type in HTTP header before actully send out(it can be done in browser extension), so we can write raw http data and send in arbitary encode type.
But the disadvantage is that this technique is limited by Same Origin Protocol even in extension.

A1: So, you must check the corresponding checkbox in the panel excpet when you want to send data in x-www-form-urlencoded.(Otherwise it will do urldecode to your postdata and pack data to a form and call form.submit() which can cross origin and is more reliable )

Q2. How to send data in multipart-form-encoded or json?
 
A2: See question one
