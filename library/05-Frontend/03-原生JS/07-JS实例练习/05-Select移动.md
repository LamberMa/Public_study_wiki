```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>

    <style>
        .outer{
            margin: 0 auto;
            background-color: darkgray;
            width: 80%;
            height: 600px;margin-top: 30px;
            word-spacing: -5px;

        }

        #left{
            display: inline-block;
            width: 100px ;
            height: 140px;
            background-color: wheat;
            text-align: center;


        }

        #choice{
            display: inline-block;
            height: 140px;
            background-color: darkolivegreen;

            vertical-align: top;
            padding:0 5px;


        }

        #choice button{
            margin-top: 20px;
        }

         #right{
            display: inline-block;
            width: 100px ;
            height: 140px;
            background-color: wheat;
            text-align: center;
            line-height: 140px;

        }

    </style>
</head>
<body>



<div class="outer">

    <select multiple="multiple" size="5" id="left">
    <option>红楼梦</option>
    <option>西游记</option>
    <option>水浒传</option>
    <option>JinPingMei</option>
    <option>三国演义</option>
</select>




<span id="choice">
    <button id="choose_move"> > </button><br>
    <button id="all_move"> >> </button>
</span>



<select multiple="multiple" size="10" id="right">
    <option>放风筝的人</option>
</select>


</div>




<script>

    var choose_move=document.getElementById("choose_move");
    var all_move=document.getElementById("all_move");

    var right=document.getElementById("right");
    var left=document.getElementById("left");
    var options=left.options;



    choose_move.onclick=function(){

        for (var i=0; i<options.length;i++){

             var option=options[i];
             if(option.selected==true){

                   // var news=option.cloneNode(true);
                   // console.log(news);

                   right.appendChild(option);
                   i--;
             }
         }
    };

    all_move.onclick=function(){

        for (var i=0; i<options.length;i++){

             var option=options[i];

                   right.appendChild(option);
                   i--;

         };
    };




    /*
   var buttons=document.getElementsByTagName("button");
   for(var i=0;i<buttons.length;i++) {
        buttons[i].onclick = function () {

            for (var i = 0; i < options.length; i++) {

                var option = options[i];

                if (this.innerText == ">") {
                    if (option.selected == true) {

                        // var news=option.cloneNode(true);
                        // console.log(news);

                        right.appendChild(option);
                        i--;
                    }
                } else {
                    right.appendChild(option);
                    i--;
                }
            }
        };
    }


   */


</script>


</body>
</html>
```

