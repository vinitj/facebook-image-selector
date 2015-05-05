# facebook-image-selector
Facebook Photo selector widget in reactjs

#Screenshots

![Select Album](/screenshots/Albums.png?raw=true "Select Album")

![Select Image](/screenshots/Photos.png?raw=true "Select Photos")


## Installation

Install via npm:

    % npm install facebook-image-selector
    

## Usage

Library expects two mandatory props and two optional props. The mandatory ones includes `appId` as string and `onSelection` as function which gets called finally after selecting an image with a parameter consists of an output. 

The optional ones are `clickText` which basically shows up on UI during the initially Load (clicking on this only causes the widget to load). Other one is `getURL` which makes widget to return normal object consisting of `imageId`, `url`, `width`, `height` and `creation time` as keys) instead of file object(blob) to `onSelection` function.


    var React = require('react'),
        FacebookUploader = require('facebook-image-selector'),
        Component;
    
        Component = React.createClass({
            render : function () {
                return (<FacebookUploader appId="" clickText="Some Text" onSelection={this.handle} getURL={true} />);
            },
            handle : function (file) {
                console.log(file);
            }
        });
        
  
  CSS for the clickText can be changed according to one's requirement. Corresponding class is `fbImageSelectorText` 
 

To Load using `browserify`, one can use following example

index.js:

    var React = require('react'),
        FacebookUploader = require('facebook-image-selector'),
        Component;
    
        Component = React.createClass({
            render : function () {
                return (<FacebookUploader appId="" clickText="Some Text" onSelection={this.handle}/>);
            },
            handle : function (file) {
                console.log(file);
            }
        });
        
    React.render(<Component />, document.getElementById('fbload'));


Run `browerify` to convert the file `browserify index.js -o bundle.js`

Use it in the html accordingly, example :

    <!DOCTYPE html>
    <html>
      <body>
        <div id="fbload"></div>
        <script src="./bundle.js"></script>
      </body>
    </html>


  
