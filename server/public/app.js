<!-- Comment -->
<html>

        <head> 
                <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre.min.css">
                <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-exp.min.css">
                <link rel="stylesheet" href="https://unpkg.com/spectre.css/dist/spectre-icons.min.css">
        </head>
        <script src="http://maps.google.com/maps/api/js?sensor=false"></script>
        <script>

                function init(){
                    var latlng = new google.maps.LatLng(42.350702, -71.107180);
                    var myOptions = {
                        zoom : 15,
                        center : latlng,
                        mapTypeId : google.maps.MapTypeId.ROADMAP
                    };
                  var map = new google.maps.Map(document.getElementById('map'), myOptions);
                
                    // ------------------------------------------------------
                    //
                    //     YOUR CODE: add marker
                    //
                    // ------------------------------------------------------	
                    var coordinates = [
                  {lat:42.350702, lng:-71.107180},
                  {lat:42.359043, lng:-71.093457},
                  {lat:42.373454, lng:-71.118863},
                  {lat:42.407484, lng:-71.119023},  
                  {lat:42.335549, lng:-71.168495}
                ];
                
                  coordinates.forEach(function(coordinate, index) { 
                      new google.maps.Marker({
                          position: new google.maps.LatLng(coordinate.lat, coordinate.lng),
                          map: map,
                          title: 'Hello World' + index
                      })
                  });
                
                  /*
                    var marker = new google.maps.Marker({
                        position : latlng, 
                        map: map,
                        title: 'Hello World'
                    }); */
                }
                
                google.maps.event.addDomListener(window,'load',init);
                
                
                </script>
  <head>
   <meta name="viewport" content="width=device-width, initial-scale=1">
   <style>
   .switch {
     position: relative;
     display: inline-block;
     width: 60px;
     height: 34px;
   }
   
   .switch input {display:none;}
   
   .slider {
     position: absolute;
     cursor: pointer;
     top: 0;
     left: 0;
     right: 0;
     bottom: 0;
     background-color: #ccc;
     -webkit-transition: .4s;
     transition: .4s;
   }
   
   .slider:before {
     position: absolute;
     content: "";
     height: 26px;
     width: 26px;
     left: 4px;
     bottom: 4px;
     background-color: white;
     -webkit-transition: .4s;
     transition: .4s;
   }
   
   input:checked + .slider {
     background-color: #2196F3;
   }
   
   input:focus + .slider {
     box-shadow: 0 0 1px #2196F3;
   }
   
   input:checked + .slider:before {
     -webkit-transform: translateX(26px);
     -ms-transform: translateX(26px);
     transform: translateX(26px);
   }
   
   /* Rounded sliders */
   .slider.round {
     border-radius: 34px;
   }
   
   .slider.round:before {
     border-radius: 50%;
   }
   </style>
   </head>>
   

</body> 

<header class="navbar">
        <section class="navbar-section">
          <img src="Bikely-logo.png" style="width:50px;height:40px;">
        </section>
        <section class="navbar-section">
          <input type="Bikely">
        </section>
      </header>
    <div class="btn-group btn-group-block">
        <button class="btn btn-primary">Bikes</button>
        <button class="btn">Company</button>
        <button class="btn btn-primary">Docks</button>
    </div>

    <label class="switch">
      <input type="checkbox">
      <span class="slider round"></span>
    </label>
    <label class="switch">
      <input type="checkbox">
      <span class="slider"></span>
    </label>
    
    <label class="switch">
      <input type="checkbox" checked>
      <span class="slider"></span>
    </label><br><br>
    
    <label class="switch">
      <input type="checkbox">
      <span class="slider round"></span>
    </label>
    
    <label class="switch">
      <input type="checkbox" checked>
      <span class="slider round"></span>
    </label>
    <ul class="tab tab-block">
            <li class="tab-item active">
              <a href="#">Bikes</a>
            </li>
            <li class="tab-item">
              <a href="#">Docks</a>
            </li>  
          </ul>
<div id="map" style="width: 640px; height: 480px"></div>
</body>



</html>
