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
var InstaSearchComponent = React.createClass({
    getInitialState: function(){
        return{
            
        };
        
    },
    getDefaultProps: function(){
        
    },
    propTypes: {
        
    },
    shouldComponentUpdate: function(nextProps, nextState){
        
    },
    loadResultsFromServer: function(query){
        
    },
    handleSelect: function(selectedResult){
        
    },
    handleChange: function(query){
       
    },
    showResults: function(){
        
    },
    hideResults: function(){
        
    },
    handleFocus: function(){
        
    },
    handleBlur: function(){
        
    },
    handleTouchMove: function(){
      
        
    },
    clearState: function(){
        
    },
    blurInput: function(){
        
    },
    componentDidMount: function(){
        
    },
    componentWillMount: function(){
        
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
                </div>
                {
                    this.state.ShowResults && 
                    <LoadingComponent
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
  <InstaSearchComponent />,
  document.getElementById('app')
);