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
                return (<FacebookUploader appId="" clickText="" onSelection={this.handle}/>);
            },
            handle : function (file) {
                console.log(file);
            }
        });
        
  
  CSS for the clickText can be changed according to one's requirement. Corresponding class is `fbImageSelectorText` 
 


  
