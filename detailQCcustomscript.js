window.coveoCustomScripts['default'] = function (promise) {


    // Example of code to change the query when "buildingQuery" event fires
    // $('.CoveoSearchInterface').on('buildingQuery', function (e, args) {
            // args.queryBuilder.expression.add('automotive');
    // });


    function handleNewResultDisplayed(e, args) {

        var elem = args.item;
        var rootSearchInterface = Coveo.get(document.getElementById('search'), Coveo.SearchInterface);

        // ****************************************************************************************************** //
        // *  This section sets the CoveoResultLink (url) to point to the matching External Object detail page  * //
        // ****************************************************************************************************** //
        if (args.result.raw.connectortype === "SharePoint") {

            if (args.result.raw.sfexternalid === undefined) {
                console.log('The raw.sfexternalid was not found - check that the resultTemplate includes this field');
            } else {

                var externalID = args.result.raw.sfexternalid;
                var qc = rootSearchInterface.queryController;
                var qb = new Coveo.QueryBuilder();
                qb.constantExpression.addFieldExpression('@sfexternalid', '==', [externalID]);
                qb.constantExpression.addFieldExpression('@objecttype', '==', ['items_Compass__x']);
                qb.enableDebug = true;

                rootSearchInterface.queryController.getEndpoint()
                    .search(qb.build())
                    .then(function (elem, response) {
                        if (response.results) {
                            var originalsfid = response.results[0].raw.sfid;
                            var resultLink = elem.getElementsByClassName('CoveoResultLink')[0];
                            resultLink.setAttribute('href', '/Compass/'+originalsfid);
                            debugger;
                        }
                    }.bind(this, elem));
            }
        }

        // ********************************************************************************************* //
        // *  This section is to set a button to retrieve the QV html (body) and show it in an iFrame  * //
        // ********************************************************************************************* //
        var thisUniqueId = args.result.uniqueId;              // the uniqueId is required to retrieve the QuickView html (see below)
        var iframe = elem.querySelector(".QViframe");         // iframe in the Result Template will be used to display QV
        var myModal = elem.querySelector("#myModal");

        // Add onclick event code.  This will open the modal section of page layout, retreive QuickView, and populate that in an iFrame.
        var btnDetail = elem.querySelector(".btnDetail");  // Button used to display modal window with more details about the item
        btnDetail.addEventListener('click', function() {

            rootSearchInterface.queryController.getEndpoint()
                .getDocumentHtml(thisUniqueId)
                .done(function(content) {
                    console.log('have text');
                    var toWrite = content.getElementsByTagName('html')[0].outerHTML;
                    iframe.contentWindow.document.open();
                    iframe.contentWindow.document.write(toWrite);
                    iframe.contentWindow.document.close();
                });

            myModal.style.display = 'block';
            return false;
        }, false);

        // Add onclick event code to clsoe the modal section.
        var spanCloseModal = elem.querySelector(".close"); // "x" that user clicks to close the modal
        spanCloseModal.addEventListener('click', function() {
          myModal.style.display ='none';
          return false;
        }, false);

    }

    // This code runs for each Coveo result displayed
    Coveo.$$(document.getElementById('search')).on(Coveo.ResultListEvents.newResultDisplayed, handleNewResultDisplayed);


}
