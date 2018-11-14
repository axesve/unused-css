/*
MIT License

Copyright (c) 2018

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


https://github.com/axesve/unused-css

*/


var tags = ["::", "h1", "::"];
var html_files_supported = [".html",".php"];
var css_files_supported = [".css",".scss"];

setInterval(()=>{
    var html = document.getElementById("html").value;
    var css = document.getElementById("css").value;

	if(html.length > 0 && css.length > 0){
		document.getElementById("nice").classList.remove('disabled');
		document.getElementById("nice").classList.remove('red');
		document.getElementById("nice").classList.add('blue');
	}else{
		document.getElementById("nice").classList.add('disabled');
		document.getElementById("nice").classList.add('red');
	}

},50);



window.onload = function() {
   var html_input = document.getElementById('html');
   var html_input_data = document.getElementById('html_file_data');

   var css_input = document.getElementById('css');
   var css_input_data = document.getElementById('css_file_data');


   html_input.addEventListener('change', function(e) {
   	  $("#html-file").addClass('done');
      var file = html_input.files[0];

      if (html_files_supported.includes(file.name.substring(file.name.indexOf("."), file.name.length)) && file.name != null) {
         var reader = new FileReader();

         reader.onload = function(e) {
            html_input_data.innerText = reader.result;
         }

         reader.readAsText(file);
      } else {
        console.log("FILE NOT SUPPORTED!");
        $("#html-file").removeClass('done');
      }
   });

      css_input.addEventListener('change', function(e) {
      $("#css-file").addClass('done');
      var file = css_input.files[0];

        if (css_files_supported.includes(file.name.substring(file.name.indexOf("."), file.name.length)) && file.name != null) {
         var reader = new FileReader();

         reader.onload = function(e) {
            css_input_data.innerText = reader.result;
         }

         reader.readAsText(file);
       } else {
         console.log("FILE NOT SUPPORTED!");
         $("#css-file").removeClass('done');
       }

   });
}

var unused_css = [];
var keep_css = [];
var html, htmlLines, htmlSelectors;
var css, cssLines, cssSelectors;

function runFunc() {
	//Get HTML and CSS values
    html = document.getElementById("html_file_data").value;
    css = document.getElementById("css_file_data").value;

    //Arrays
    cssLines = [];
    cssSelectors = [];


    //Split new lines into array
    cssLines = css.split('}');


    //Check each line and look if it starts with . or # then get its name untill {
    for (var i = cssLines.length - 1; i >= 0; i--) {
        if (cssLines[i].charAt(0) == "." || cssLines[i].charAt(0) == "#") {
        	var line = cssLines[i].substr(0, cssLines[i].indexOf('{'));
            if(line.substring(line.length-1) == " "){
                cssSelectors.push(line.substring(0, line.length-1));
            }else{
                cssSelectors.push(line.substring(0, line.length));
            }
        }
    }

    //Get HTML code
    htmlLines = [];
    htmlSelectors = [];

    //Split new lines into array
    htmlLines = html.split('<');

    //Looks at each line and finds class= or id=
    for (var i = 0; i < htmlLines.length; i++) {

    	//Check if line is not empty (kinda)
        if (htmlLines[i].length > 3) {

            var class_index = 0;

            //Check line if it contains a class and get its index
            class_index = htmlLines[i].search("class=");

            //If it does then start at the index and take out any un needed information, etc strips class="class"></div> to "class"
            if (class_index > -1) {
                var line = htmlLines[i].substring(class_index, htmlLines[i].length);
                line = line.substring(0, line.indexOf(">")).substring(line.indexOf('"'), line.length);

                //Split "class" into class
                var final = "." + line.split(/"/)[1];

                //Check if class has multiple clases then add those too
                if (final.search(" ") > -1) {

                    var multiClass = final.split(" ");

                    var old_val = "";
                    //check each multiple class and add a . infront if it does not have one
                    for (j = 0; j < multiClass.length; j++) {
                        if (multiClass[j].charAt(0) != "." && multiClass[j] != null) {
                            	htmlSelectors.push("." + multiClass[j]);
                        } else { //If it does then just add it
                            if (!htmlSelectors.includes(multiClass[j])) {
                                htmlSelectors.push(multiClass[j]);
                            }
                        }
                }

                } else {//If class is not a multi class then add it

                    if (!htmlSelectors.includes(final)) {
                        htmlSelectors.push(final);
                    }
                }
            }

            var id_index = 0;

            id_index = htmlLines[i].search("id=");

            //If it does then start at the index and take out any un needed information, etc strips id="id"></div> to "id"
            if (id_index > -1) {

                var line = htmlLines[i].substring(id_index, htmlLines[i].length);
                line = line.substring(0, line.indexOf(">")).substring(line.indexOf('"'), line.length);
                var final = "#" + line.split(/"/)[1];

                if (!htmlSelectors.includes(final) && !/^[$]+$/.test(final)) {
                    htmlSelectors.push(final);
                }
            }

        }
    }


    //Clean up
    cssSelectors.sort();
    htmlSelectors.sort();
    var html_selectors_clean = [];

    html_selectors_clean = removeDuplicates(htmlSelectors);

    /*
        //Remove CSS tags such as :: h1, h2, h3 etc?
        for (var y = 0; y < cssSelectors.length; y++) {
        	for (var a = 0; a < tags.length; a++) {
    	    	if(cssSelectors[y].search(tags[a]) > -1){
    	    		cssSelectors.splice(y,1);
    	    	}
    	    }
        }
    */

    //Check if CSS is in HTML Selectors
    for (var f = 0; f < cssSelectors.length; f++) {
    	if(!html_selectors_clean.includes(cssSelectors[f])){
    		unused_css.push(cssSelectors[f]);
    	}
    }

    for (var r = 0; r < unused_css.length; r++) {
    	if(html_selectors_clean.includes(unused_css[r].substring(0, unused_css[r].indexOf(" ")))){
    		unused_css.splice(r,1);
    	}
    }

    $(".result").show();
    $("#options").addClass('blur');

    $("#result_html").val(html_selectors_clean.join("\n"));
    $("#result_css").val(cssSelectors.join("\n"));

    for (var t = 0; t < unused_css.length; t++) {
    	$("<div id='"+t+"' class='unused_css_selector' selector='"+unused_css[t]+"'>"+unused_css[t]+"</div>").appendTo('#unused_result_css');
    }

    $(".unused_css_selector").on("click",function(){

    	if(!$(this).hasClass('keep')){
			$(this).addClass('keep');
			keep_css.push(unused_css[$(this).attr("id")]);
		}else{
			$(this).removeClass('keep');
			removeA(keep_css,$(this).attr("selector"));
		}
	});
}


var finalCSS = "";

(function () {
var textFile = null,
  makeTextFile = function () {


    //Fixa så att den tar bort Klasserna från filen
    //Fixa så att den behåller keep

    for (var i = 0; i < cssLines.length; i++) {
        var _class = cssLines[i].substring(0,cssLines[i].indexOf("{")-1);

        if(unused_css.indexOf(_class) == -1){
            finalCSS += cssLines[i] + "}" + "\r\n" + "\r\n";
        }
    }

    var data = new Blob([finalCSS], {type: 'text/plain'});

    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }

    textFile = window.URL.createObjectURL(data);

    return textFile;
  };


  var create = document.getElementById('download');

  create.addEventListener('click', function () {
    var link = document.getElementById('download');
    link.href = makeTextFile();
    link.style.display = 'block';
  }, false);
})();



function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
}

function removeDuplicates(arr){
    let unique_array = []
    for(let i = 0;i < arr.length; i++){
        if(unique_array.indexOf(arr[i]) == -1){
            unique_array.push(arr[i])
        }
    }
    return unique_array
}
