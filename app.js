
// Displays grid if images
//Example component used by our custom resultSelected function ( custom-functions.js )

var GridComponent = React.createClass({
   
    getInitialState: function(){
        
    },
    render: function(){
        var resultNodes;
        
        if(this.state.data){
            
            resultNodes = this.state.data.map(function(result){
                return (
                    <div className="item" id={result.id} key={result.id} >
                        <div className="dummyHeight"> </div>
                        <img src={result.image} />
                    </div>
                );
            });
            
        }
        
        return ( 
            <div>
                <div className="clearfix">
                { resultNodes}
              </div>
              <div className="loadingContainer">
              {
                  this.state.nextPage &&
                <LoadingComponent icon="images/loading.gif" />
              }
              </div>
            </div>
            );
    },
});

var customFunctions = {
        instagramClientId: '02d26cb819954ba7b5c3c072a885759f',
        instagramCount: 28,
        // customize this function to reformat the data return by your endpoint

        requestHandler: function(query, limit, callback){

        var endpoint = 'https://api.instagram.com/v1/users/search';
                var requestParams = {
                client_id : instagramClientId,
                q: query,
                count: limit
                };
                var wrappedCallback = function(data){

                // You must set an image and "name" key for each result

                var renameData = data.data.map(function(result){
                result.image = result['profile_picture'];
                        result.name = result['username'];
                        return result;
                });
                        callback(renameData);
                }

        request(endpoint, rquestedParams, wrappedCalleback);
                },
        
        
        // customize this function to do something when a result is selected
        selectedHandler: function(results){
            
            var endpoint = "https://api.instagram.com/v1/users/" + result.id + "/media/recent";
            
            var requestParams = {
                client_id: instagramClientId,
                count: instagramCount
            }
            
            request(endpoint,requestParams,function(data){
                
                var gridItems = data.data.map(function(result){
                    result.image = result.images.low_resolution.url;
                    return result;
                });
                
                var nextPage = data.pagination.next_url;
                
                React.render(
                        <GridComponent initialData={gridItems} initialNextPage = {nextPage} />,
                        document.getElementById('grid')
                        );
                
            });
            
        }
        


};


var InputComponent = React.createClass({
    shouldComponentUpdate: function(nextProps,nextState){
        return false;
    },
    handleChange: function(event){
        this.props.handleChange(event.target.value)  ;
    },
    handleFocus: function(event){
        this.props.handleFocus(event);
    },
    handleBlur: function(event){
        this.props.handleBlur(event);
    },
    render: function(){
        return (
            <input
                type="text"
                autoCorrect="off"
                autoComplete="off"
                autoCapitalize="off"
                placeholder={this.props.placeholder}
                className="input-typeahead"
                onChange={this.handleChange}
                onFocus= {this.handleFocus}
                onBlur={this.handleBlur}
                ref="input" />
        );
    }
});

var LoadingComponent = React.createClass({
    shouldComponentUpdate: function(nextProps,nextState){
        return false;
    },
    render: function(){
        return (
          <img className="loading-icon"  src={this.props.icon} />
        );
    }
});

var ResultsComponent = React.createClass({
    getInitialState: function(){
        return {
            isHovered: false
        };
    },
    handleSelect: function(event){
        this.props.handleSelect(this.props.data);
        event.preventDefault();
        event.stopPropagation();
    },
    shouldComponentUpdate: function(nextProps,nextState){
        return(
                this.props.data.id &&
                (this.props.data.id != nextProps.data.id) ||
                this.state.isHovered !== nextState.isHovered               
                );
    },
    onMouseOver: function(){
        this.setState({isHovered:true})
    },
    onMouseLeave: function(){
       this.setState({isHovered: false})  
    },
    render: function(){
        var className= 'clearfix';
        if(this.state.isHovered)
            className += 'hovered';
        return (
           <li className={className}      onClick={this.handleSelect} onMouseOver={this.onMouseOver} onMouseLeave={this.onMouseLeave} >
            {
               this.props.image && <img src={this.props.image} />
            }
            <div> {this.props.children}</div>
            </li>
         );
    }    
});
var InstaSearchComponent = React.createClass({
    getInitialState: function(){
        return{
            inputValue: '',
            showResults: false, // show or hide resultsComponent
            loading: false, // Are we currently loading the data from server
            results: [],
            resultsId: null // Unique identifier for set of results (used by ResultsComponent.shouldComponentUpdate)
        };
    },
    getDefaultProps: function(){
        return {
            text: false,
            limit: 10,
            placeholder: 'Search',
            thumbStyle: 'square',
            loadingIcon: 'images/loading.gif',
            //Blur input ontouchstart
            //Fixes an phonegap/ios bug where input cursor doesn't show up on focuss after previously blurring naturally
            // Don't enable unless experiencing this bug
            blurOnTouchStart: false,
        };
    },
    propTypes: {
        limit: React.PropTypes.number,
        placeholder: React.PropTypes.string,
        thumbStyle: React.PropTypes.oneOf(['circle','square']),
        requestHandler: React.PropTypes.func.isRequired,
        selectedHandler: React.PropTypes.func.isRequired
    },
    shouldComponentUpdate: function(nextProps, nextState){
        return (
                this.state.resultsId !== nextState.resultsId ||
                this.state.loading !== nextState.loading ||
                this.state.showResults !== nextState.showResults
                );
    },
    loadResultsFromServer: function(query){
        
        this.setState({laoding:true});
        
        this.props.requestHandler(query,this.props.limit,function(data){
            
            // If inputValue changed prior to request completing don't bother to render
            if(this.state.inputValue != query){
                return false;
            }
            
            //Truncate data to specific limit
            data = data.slice(0,this.props.limit);
            
            this.setState({
                results: data,
                resultsId: query,
                loading: false
            });
            
        }.bind(this));
    },
    handleSelect: function(selectedResult){
        this.props.selectedHandler(selectedResult);
        this.clearState();
        
    },
    handleChange: function(query){
       
       clearTimeout(window.loadResultsTimeout);
       
       if(query){
           
           this.setState({ inputValue: query });
           
           window.loadResultsTimeout = setTimeout(function(){
               this.loadResultsFromServer(query);
           }.bind(this),200);
       }else{
           this.clearState();
       }
    },
    showResults: function(){
        
        if(this.state.showResults === false){
            this.setState({showResults: true});
        }
        
        //cancel any pending hide results timeout
        clearTimeout(window.blurHideResultsTimeout);
    },
    hideResults: function(){
        
        if(this.state.showResults === true){
            this.setState({ showResults: false});
        }
       // cancel any pending hide results timeout
        clearTimeout(window.blurHideResultsTimeout);
    },
    handleFocus: function(){
        this.showResults();
    },
    handleBlur: function(){
        // Hide Results after a 400ms delay
        // This gives us ability to keep results open by cancelling this timeout
        // TODO: Find　 a cleaner way to do this
        
        window.blurHideResultsTimeout = setTimeout(function(){
            this.hideResults(); //Hide
        }.bind(this),400);
    },
    
    // Attached to #instantSearch div onTouchMove
    //cancels delayed hiding of results (see this.handleBlur) so menu stays open while scrolling
    handleTouchMove: function(){
      
        // If we are NOT auto-blurring on touch.we need to do it here
        if(this.props.blurOnTouchStart === false){
            this.blurInput();
        }
        
        // Prevents results from hiding
        clearTimeout(window.blurHideResultsTimeout);
    },
    clearState: function(){
        
        this.setState({
           results: [],
           resultsId: null,
           inputValue: '',
           loading: false
        });
    },
    blurInput: function(){
        
        this.refs.inputComponent.refs.input.getDOMNode().blur();
        
    },
    componentDidMount: function(){
        
        // Blur the input when the user touches anywhere on the screen
        // This fixes a nasty bug on ios in phonegap webview where a natural blur ( due to clicking somewhere on screen )
        // .. will results in the input's blinking caret not displaying next time the input is in focus
        // Triggering a blur manually ontouchstart seems to solve this problem
        // Capture phase (rather　manually bubbling phase) sp it's callled before any other events
        
        if(this.props.blurOnTouchStart === true){
            document.addEventListener('touchstart',this.blurInput,true);
        }
    },
    componentWillMount: function(){
        
        clearTimeout(window.blurHideResultsTimeout);
        
        if(this.props.blurOnTouchStart === true){
            document.removeEventListener('touchstart',this.blurInput,true);
        }
    },
   render: function() {
       return (
           <div id="instatype" onTouchMove={this.handleTouch}>
                <div className="input-wrapper">
                    <InputComponent 
                     placeholder={this.props.placeholder} 
                     handleChange={this.handleChange}
                     handleFocus={this.handleFocus}
                     handleBlur={this.handleBlur}
                     ref="inputComponent" />
                    
                    {
                        this.state.Loading && 
                        <LoadingComponent icon={this.props.loadingIcon} />    
                    }
                </div>
                {
                    this.state.ShowResults && 
                    <ResultsComponent
                        data={this.state.results}
                        resultsId={this.state.resultsId}
                        handleSelect={this.handleSelect}
                        thumbStyle={this.props.thumbStyle} />
                }
           </div>
            
    );
   }
});

React.render(
  <InstaSearchComponent 
   placeholder="Search instagram users" 
   requestHandler={customFunctions.requestHandler}
   />,
  document.getElementById('app')
);