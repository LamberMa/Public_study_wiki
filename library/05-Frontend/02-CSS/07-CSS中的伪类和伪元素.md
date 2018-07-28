







## Examples



```
    <style>
        #bubble{
            position: relative;
            width:300px;
            height:150px;
            background-color: #5bc0de;
            margin: 200px auto;
            border-radius: 10px;
        }
        #bubble:before{
            position: absolute;
            content: '';
            width: 0;
            height: 0;
            right: 100%;
            top: 60px;
            border-top: 15px solid transparent;
            border-right: 30px solid #000;
            border-bottom: 15px solid transparent;
        }
    </style>
</head>
<body>


<div id="bubble"></div>
```

