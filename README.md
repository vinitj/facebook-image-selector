# facebook-image-selector
Facebook Photo selector widget in reactjs

## Installation

Install via npm:

    % npm install facebook-image-selector
    

## Usage

Library expects two mandatory props and one optional props. The mandatory ones includes `appId` as string and `onSelection` as function which contains file object (blob) as parameter.

The optional one is a `clickText` which basically shows up on UI on initially Load. Clicking on which causes the widget to load.

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




  
