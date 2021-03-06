import React, { Component } from 'react';
import ActivityChart from './ActivityChart'
import TopicsChart from './TopicsChart'
import ProgressChart from './ProgressChart'
import LeaderBoard from './LeaderBoard'
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css' // Import css
import {BrowserRouter as Router,Route,Link,Switch,Redirect} from 'react-router-dom'     

var config = require('../../config') 
let style={height:'1.2em'}
const createIcon = 
<svg style={style}  aria-hidden="true" data-prefix="fas" data-icon="folder-plus" className="svg-inline--fa fa-folder-plus fa-w-16" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M464 128H272l-64-64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V176c0-26.51-21.49-48-48-48zm-96 168c0 8.84-7.16 16-16 16h-72v72c0 8.84-7.16 16-16 16h-16c-8.84 0-16-7.16-16-16v-72h-72c-8.84 0-16-7.16-16-16v-16c0-8.84 7.16-16 16-16h72v-72c0-8.84 7.16-16 16-16h16c8.84 0 16 7.16 16 16v72h72c8.84 0 16 7.16 16 16v16z"></path></svg>

export default class ProfilePage extends Component {
    
    constructor(props) {
        super(props);
        this.saveUser = this.saveUser.bind(this);
        this.change = this.change.bind(this);
        this.state = {
            warning_message: '',
            //user : {
                //_id: this.props.user && this.props.user._id?this.props.user._id:'',
                //name:this.props.user && this.props.user.name?this.props.user.name:'',
                //username:this.props.user && this.props.user.username?this.props.user.username:'',
                //difficulty:this.props.user && this.props.user.difficulty?this.props.user.difficulty:'',
                //avatar:this.props.user && this.props.user.avatar?this.props.user.avatar:'',
                //password:'',//this.props.user && this.props.user.password?this.props.user.password:'',
                //password2:'',//this.props.user && this.props.user.password?this.props.user.password:'',
            //},
            user:this.props.user,
            questions_award:'',
            topics_award:'',
            recall_award:'',
            streak_award:'',
            distribution_award:'',
        }
        this.addAward = this.addAward.bind(this);
       // //console.log(['constr',this.state]);
    };
    
    componentDidMount() {
		// load recent user into state
		let that = this;
		this.props.analyticsEvent('profile page');
		if (this.props.token) {
			fetch('/login/me?code='+this.props.token.access_token, {
			  method: 'GET',
			}).then(function(response) {
				return response.json();
				
			}).then(function(res) {
			 //  console.log(['REFRESH LOGIN me',res]);
				let state={};
				state.user = res.user;
				that.setState(state);
			})
			.catch(function(err) {
				console.log(['ERR',err]);
			});
		}
	}

    addAward(type,awardData) {
        //console.log(['ADDAWARD',type,awardData]);
        let newState={};
        let award=null;
        let that=this;
        if (type==="questions" || type==="streak" || type==="recall") {
            let newState={};
            newState[type] = awardData;
            this.setState(newState);
            
            //this.saveUser().then(function() {
                    //that.setState({'warning_message':''});
            //});
            
        }
        function getGreenToRed(percent){
            let r = percent<50 ? 255 : Math.floor(255-(percent*2-100)*255/100);
            let g = percent>50 ? 255 : Math.floor((percent*2)*255/100);
            return 'rgb('+r+','+g+',0)';
        }
        if (type==="questions") {
            if (parseFloat(awardData) > 0)  {
                let borderColor = getGreenToRed(awardData/1000*100);
                let buttonStyle={backgroundColor:borderColor,borderColor:borderColor ,color: 'black',fontWeight: 'bold'}
                if (parseFloat(awardData) < 25)  {
                    award=<button style={buttonStyle} className="btn-outline btn" >New User</button>
                } else if (parseFloat(awardData) < 50)  {
                    award=<button style={buttonStyle} className="btn-outline btn" >Beginner</button>
                } else if (parseFloat(awardData)< 100)  {
                    award=<button style={buttonStyle} className="btn-outline btn" >50 Questions</button>
                } else if (parseFloat(awardData)< 150)  {
                    award=<button style={buttonStyle} className="btn-outline btn" >100 Questions</button>
                } else if (parseFloat(awardData)< 200)  {
                    award=<button style={buttonStyle} className="btn-outline btn" >150 Questions</button>
                } else if (parseFloat(awardData)< 300)  {
                    award=<button style={buttonStyle} className="btn-outline btn" >200 Questions</button>
                } else if (parseFloat(awardData)< 400)  {
                    award=<button style={buttonStyle}  className="btn-outline btn" >300 Questions</button>
                } else if (parseFloat(awardData)< 500)  {
                    award=<button style={buttonStyle} className="btn-outline btn" >400 Questions</button>
                } else if (parseFloat(awardData)< 1000)  {
                    award=<button style={buttonStyle}  className="btn-outline btn" >500 Questions</button>
                } else  {
                    award=<button style={buttonStyle}  className="btn-outline btn" >1000 Questions</button>
                }
            } else {
                award=null;
            }
                
        } else if (type==="topics") {
            if (awardData > 0) {
                let borderColor = getGreenToRed(awardData/30*100);
                let buttonStyle={backgroundColor:borderColor,borderColor:borderColor ,color: 'black',fontWeight: 'bold'}
                
                award=<button style={buttonStyle} className="btn-outline-primary btn" >{awardData} Topics Complete</button>
            }
        } else if (type==="recall") {
            if (parseFloat(awardData) >=0) {
                let borderColor = getGreenToRed((awardData)*100);
                let buttonStyle={backgroundColor:borderColor,borderColor:borderColor ,color: 'black',fontWeight: 'bold'}
                
                if (parseFloat(awardData)<= 0.1)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >1. Novice Numbat</button>
                } else if (parseFloat(awardData) <= 0.2)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >2. Beginner Bandicoot</button>
                } else if (parseFloat(awardData) <= 0.3)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >3. Initiate Ibis</button>
                } else if (parseFloat(awardData) <= 0.4)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >4. Student Sloth</button>
                } else if (parseFloat(awardData) <= 0.5)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >5. Expert Echidna</button>
                } else if (parseFloat(awardData) <= 0.6)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >6. Master Magpie</button>
                } else if (parseFloat(awardData) <= 0.7)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >7. Wizard Water Dragon</button>
                } else if (parseFloat(awardData) <= 0.8)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >8. Guru Goanna</button>
                } else if (parseFloat(awardData) <= 0.9)  {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >9. Superstar Seal</button>
                } else {
                    award=<button style={buttonStyle} className="btn-outline-primary btn" >10. Perfect Platypus</button>
                }
            } else {
                award=null;
            }
            
        } else if (type==="streak") {
            if (awardData > 1) {
                let borderColor = getGreenToRed(awardData/31*100);
                let buttonStyle={backgroundColor:borderColor,borderColor:borderColor ,color: 'black',fontWeight: 'bold'}
                
                award=<button style={buttonStyle}  className="btn-outline-primary btn" >{awardData} days in a row</button>
            }
            
        } else if (type==="distribution") {
            if (awardData && awardData.val && awardData.status && awardData.status.length > 0) {
                let borderColor = getGreenToRed(awardData.val);
                let buttonStyle={backgroundColor:borderColor,borderColor:borderColor ,color: 'black',fontWeight: 'bold'}
                
                award=<button  style={buttonStyle} className="btn-outline-primary btn" >{awardData.status}</button>
            }
        } 
        newState[type+'_award']=award;
        this.setState(newState);
    };
    
    
    saveUser(e) {
        if (e) e.preventDefault();
        var that = this;
        that.setState({'warning_message':''});
        ////console.log('save user ',this.state.user);
        var data = {
            '_id': this.state.user._id,
          }
          if (this.state.user.name)  data.name= this.state.user.name;
          if (this.state.user.avatar)  data.avatar= this.state.user.avatar;
          if (this.state.user.username)  data.username= this.state.user.username;  
          //if (this.state.user.difficulty) data.difficulty=this.state.user.difficulty
            
          if (this.state.user.password && this.state.user.password.length > 0 && this.state.user.password2 && this.state.user.password2.length > 0) {
            data.password= this.state.user.password
            data.password2= this.state.user.password2
            if (data.password !== data.password2) {
                that.setState({'warning_message':'Passwords do not match'});
                return;
            }
          }
          //if (this.state.questions) {
              //data.questions=this.state.questions;
          //}
          //if (this.state.streak) {
              //data.streak=this.state.streak;
          //}
          //if (this.state.recall) {
              //data.recall=this.state.recall;
          //}          
          return this.props.saveUser(data,this);  
            
    };
    
    clickImport() {
         confirmAlert({
          title: 'Import Selection',
          message: 'Which sheet do you want to import?',
          buttons: [
            {
              label: 'Archive',
              onClick: () => this.props.import(0)
            },
            {
              label: 'Active',
              onClick: () => this.props.import(1)
            },
            {
              label: 'Cancel',
              onClick: () => {}
            }
          ]
        })
    }
    
    change(e) {
        let state = {...this.state.user};
        var key = e.target.name;
        if (e.target.name.startsWith('fake_')) {
            key = e.target.name.slice(5);
        }
        state[key] =  e.target.value;
       // //console.log(['CHANGE',state]);
        this.setState({'user':state});
        return true;
    };
    
    allowAlexa(allow) {
        if (allow) {
            //console.log('allow');
            // redirect with auth code
            this.getCode();
            
        } else {
            //console.log('deny');
        }
        localStorage.setItem('oauth',null);
        localStorage.setItem('oauth_request',null);
        return true;
    };
    
    
    getCode() {
        //console.log('get code');
        let authRequest = localStorage.getItem('oauth_request');
        //console.log([authRequest,this.props.token,this.props.user]);
        if (this.props.token && this.props.user && authRequest) {
            let auth =JSON.parse(authRequest);
            if (!auth) auth={};
            var params={
                'response_type':'code',
                'client_id':config.clientId,
                'client_secret':config.clientSecret,
                'redirect_uri':auth.redirect_uri,
                'scope':auth.scope,
                'state':auth.state
              };
              //console.log(['pars',params]);
            fetch('/oauth/authorize', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Bearer '+this.props.token.access_token
                //Authorization: 'Basic '+btoa(config.clientId+":"+config.clientSecret) 
              },
              body: Object.keys(params).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k])).join('&')
            }).then(function(response) {
                //console.log('HEADERS',response.headers.location);
                
                return response.json();
                
            }).then(function(res) {
                //console.log(['getcode response',res]);
              
            })
            .catch(function(err) {
                //console.log(['ERR',err]);
            });
        }
  }
//            <a className='btn btn-info' onClick={() => this.allowAlexa.bind(this)(true)} >Yes</a>
    
    dumpalexa() {
        fetch('/api/dumpalexa', {});
    };
    refreshindexes() {
        fetch('/api/indexes?rand='+Math.random(), {});
    };
    
    render() { //req,vars/
        let oauth=localStorage.getItem('oauth');
        let authRequest = localStorage.getItem('oauth_request');
        //console.log([authRequest,this.props.token,this.props.user]);
        let auth =JSON.parse(authRequest);
        if (!auth) auth={};

        if (oauth==="alexa") {
            return (
            <div className='row'>
            <div className='col-12'><h4>Allow Alexa to integrate with Mnemo's Library ?</h4></div>
            
            <div className='col-4'>&nbsp;</div>
            <div className='col-2'><form action={config.authorizeUrl} method="POST">
            <input type='hidden' name='response_type'  value='code' />
            <input type='hidden' name='client_id'  value={config.clientId}/>
            <input type='hidden' name='client_secret'  value={config.clientSecret}/>
            <input type='hidden' name='redirect_uri'  value={auth.redirect_uri} />
            <input type='hidden' name='scope'  value={auth.scope}/>
            <input type='hidden' name='state'  value={auth.state}/>
            <input type='hidden' name='access_token'  value={this.props.token.access_token}/>
            <button type='submit' className='btn btn-info' onClick={() => this.allowAlexa.bind(this)(false)} >Yes</button>
            </form></div>
            <div className='col-2'><a className='btn btn-info' href='/' onClick={() => this.allowAlexa.bind(this)(false)} >No</a></div>
            <div className='col-4'>&nbsp;</div>
            </div>
            
            );
        } else {
            if (this.props.user && this.props.user._id && this.props.user._id.length > 0) {
                
                return (
                <form method="POST" onSubmit={this.saveUser} className="form-group" autoComplete="false" >
                        <div style={{position: 'fixed', top: '60', right: '0', zIndex:999}} >
                                  <a  href='#topics'  className='btn btn-info'>Topics</a>
                                  <a  href='#progress'  className='btn btn-info'>Progress</a>
                                  <a  href='#activity'  className='btn btn-info'>Activity</a>
                                  <a  href='#edit'  className='btn btn-info'>Edit</a>
                                  <a  href='#leaderboard'  className='btn btn-info'>Leaders</a>
                                  <a  href='#' onClick={() => this.props.logout()} className='btn btn-info btn-danger' >
                                   Logout
                                  </a>
                                  {this.props.isAdmin() && 
                                  <span><a  href='#' onClick={() => this.clickImport()} className='btn btn-info btn-warning' >
                                   Import
                                  </a>
                                  <a  href='#' onClick={() => this.dumpalexa.bind(this)()} className='btn btn-info btn-warning' >
                                   Train
                                  </a>
                                  
                                  </span>
                                  }
                                  <span className="dcol-4">
                                    <Link className="btn btn-success"  to="/create">{createIcon} <span  className="dd-none d-sm-inline">Create</span></Link>
                                  </span>
                                
                                  
                                 
                                 
                                  
                        </div>
                        <div className="row">
                            <div className='col-12 awards'>
                            <br/><br/>
                            <br/><br/>
                                <span>{this.state.streak_award}</span>
                                <span>{this.state.questions_award}</span>
                                <span>{this.state.topics_award}</span>
                                <span>{this.state.recall_award}</span>
                                 <span>{this.state.distribution_award}</span>
                            </div>
                            <div className="col-12" style={{minHeight: '700px'}}>
                                  <TopicsChart addAward={this.addAward} setCurrentPage={this.props.setCurrentPage} setQuizFromDiscovery={this.props.setQuizFromDiscovery} setReviewFromTopic={this.props.setReviewFromTopic} setQuizFromTopic={this.props.setQuizFromTopic} searchQuizFromTopic={this.props.searchQuizFromTopic}  user={this.props.user} />
                            </div>
                            <div className="col-12" style={{height: '500px'}} >
                                  <ProgressChart addAward={this.addAward} reviewBySuccessBand={this.props.reviewBySuccessBand} user={this.props.user} />
                            </div>
                            <div className="col-12" style={{height: '700px'}}>
                                  <ActivityChart addAward={this.addAward} user={this.state.user}  />
                            </div>
                            <div className="col-12" style={{height: '660px'}} >
                                <h4 id="leaderboard" className='graphTitle' >Leaderboards</h4>
                                <LeaderBoard type="streak" user={this.state.user} />
                            </div>
                            <div className="col-12" style={{height: '660px'}} >
                               <LeaderBoard type="questions" user={this.state.user}  />
                            </div>
                            <div className="col-12" style={{height: '660px'}} >
                               <LeaderBoard type="recall" user={this.state.user} />
                            </div>
                            
                            <div className="col-12">
                                  <h3  className="card-title">Profile</h3>
                                <div className='col-12 warning-message'>{this.state.warning_message}</div>
                            
                                  <a id="edit"></a>
                                   <label htmlFor="name" className='row'>Name </label><input autoComplete="falsename" id="name" type='text' name='name' onChange={this.change} value={this.state.user.name} />
                                    <label htmlFor="avatar" className='row'>Avatar </label><input autoComplete="falseavatar" id="avatar" type='text' name='avatar' onChange={this.change} value={this.state.user.avatar} />
                                
                                    <label htmlFor="username" className='row'>Email </label><input autoComplete="falseusername" id="username" readOnly="true" type='email' name='username' onChange={this.change} value={this.state.user.username}  />
                                    <label htmlFor="password" className='row'>Password</label> <input  autoComplete="falsepassword" id="password" type='password' name='fake_password' onChange={this.change}  value={this.state.user.password}  />
                                    <label htmlFor="password2" className='row'>Repeat Password</label><input  autoComplete="falsepassword2" id="password2" type='password' name='fake_password2' onChange={this.change} value={this.state.user.password2} />
                                    <input id="id" type='hidden' name='_id' value={this.state.user._id} />
                                    <br/>
                                    <br/>
                                    <button  className='btn btn-info'>Save</button>
                            </div>
                        <br/>
                    </div>
                    </form>
                )
            } else {
                return <Redirect to="/login" />
            }
            
                    
            
            
        }
    }
    

}
//<a id="edit" style={{position:'relative',x:'-40em',y:'-40em'}}></a>
                    
