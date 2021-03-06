var React = require('react');
//var Link = require('react-router').Link;
// required for ajax calls
var axios = require('axios');
var $ = require('jquery');
import { withRouter } from 'react-router';

var Parse = require('parse');
var Vote = Parse.Object.extend('Vote');
var DoughnutChart = require("react-chartjs").Doughnut;



//HULLO :) the 'value' below is to be replaced with the yes/no votes to the petition.).
var countryData = [{color: "#006729", value: 143, label: "AGREE"}, {color: "#8B2530", value: 10, label: "DISAGREE"}, {color: "rgba(0,0,0,0.5)", value: 800, label: "REMAINING"}]


var Petition = React.createClass({
  getInitialState: function() {
    // set inital state as an empty object, to be populated with bill info on componentDidMount
    return {
      petition: {
        id: 'e-270',
        title: 'Aquaculture',
        summary:"Whereas: Containing Atlantic salmon in open-net cages in our oceans has serious consequences; Adding antibiotics to fish feed which is then sprayed directly into the ocean is reckless and dangerous, considering the rapid development of antibiotic resistant bacteria and the detrimental effects it is having on human health; Pesticides released into the ocean to kill sea lice on salmon are killing lobsters, and detailed studies on the effects of pesticides on the environment need to be done before allowing their use in our oceans, otherwise it could be argued that this industry and government are using a food source, the environment and consumers in an industrial experiment; Millions of caged salmon in the Maritimes are being killed by super-chill, which is inhumane and abusive, and this practice of keeping caged fish in an area where the water can freeze should be considered unacceptable; The number of wild fish destroyed to feed farmed fish and the number of farmed fish destroyed due to the growing conditions on these sites is a testament to the unsustainable nature of this industry; and The industry's claim that escapes do not occur is unfounded, and after storms there are often buoys, nets, plastic pipes and ropes littering the shoreline adjacent to leased areas. We, the undersigned, citizens (or residents) of Canada, call upon the Government of Canada to Legislate the removal of caged salmon from our oceans.",        
        proposedBy: 'Ronald Neufeld',
        sponsor: 'Nathaniel Erskine-Smith', //For a petition to be valid it needs to have a sponsor (for example your MP). Future functionality: Feed the proposed petitions to your MP, who can choose which ones to sponsor. If they click they'll sponsor it, it becomes active on the petitions page. ALTERNATIVELY adding the 'sponsor' could be in the very final stage, where the petition receives 100 supporters and gets sent to the MP, who gets the choice of sponsoring it. If he/she doesnt, despite the fact that 100 of their constituents would like them to, then we could make this fact visible in a list under 'petitions' (petitions sent to MP (sponsored, not sponsored).
        dateOpen: "2015-06-11",
        dateClose: "2016-06-11",
        daysLeft: "124"/*NUMBER (diff between dateOpen and dateClose)*/,
        keywords: "Atlantic salmon, Retaining ponds, Water quality",
        comments: "Start the discussion"
      },
      content: "",
      vote: 0,
      greenGloVetoggle: "greenglovebutton",
      redGloVetoggle: "redglovebutton",
      shareButtonToggle: false,
      facebookButton: "",
      twitterButton: "",
    };
  },
  componentDidMount: function() {
    this.loadPetitionData();
    this.setState({content: this.state.petition.title});
    $(".petitionTabs li").removeClass("active");
    $("#tab-" + 1).addClass("active");
  },
  componentDidUpdate: function(prevProps) {
    if(prevProps.params.filter !== this.props.params.filter) {
      this.loadBillData();
    }
  },
  loadPetitionData: function() {
    var that = this;
    var petitionId = this.props.params.petitionId;
    this.setState({loading: true});
    
    axios.post('/petitioninfoget', {
      petitionId: petitionId
    })
    .then(function(response) {
      that.setState({petition: response.data, loading: false});
    })
    .catch(function(response) {
      console.log(response, 'response');
    });
    
    Parse.Cloud.run('findMyVote', {petitionId: this.props.params.petitionId}).then(function(votePetition) {
      if (votePetition) {
        if (votePetition.get('votePetition') === 1) {
          that.setState({
            greenGloVetoggle: "greenglovebutton-clicked",
            redGloVetoggle: "redglovebutton",
            vote: 1
          });
        }
        else if (votePetition.get('votePetition') === -1) {
          that.setState({
            greenGloVetoggle: "greenglovebutton",
            redGloVetoggle: "redglovebutton-clicked",
            vote: -1
          });
        }
      }
    });
  },
  handleTabClick: function(data){
    if(data===1) {
      this.setState({content: this.state.petition.title});
    }
    else if(data===2) {
      this.setState({content: this.state.petition.summary});
    }
    
    else if(data===3) {
      this.setState({content: this.state.petition.comments});
    }

    
    $(".petitionTabs li").removeClass("active");
    $("#tab-" + data).addClass("active");
  },
  handleGGloVeclick: function(e) {
    e.preventDefault();
    var votePetition = {petitionId: this.props.params.petitionId};
    
    if (this.state.greenGloVetoggle === "greenglovebutton") {
      this.setState({greenGloVetoggle:"greenglovebutton-clicked", redGloVetoggle:"redglovebutton", votePetition: 1});
      votePetition.votePetition = 1;
      Parse.Cloud.run('handleVotePetition',  votePetition);
    }
    else if (this.state.greenGloVetoggle === "greenglovebutton-clicked") {
      this.setState({greenGloVetoggle:"greenglovebutton", votePetition: 0});
      votePetition.votePetition = 0;
      Parse.Cloud.run('handleVotePetition', votePetition);
    }
  },
  handleRGloVeclick: function(e) {
    e.preventDefault();
    var votePetition = {petitionId: this.props.params.petitionId};
    if (this.state.redGloVetoggle === "redglovebutton") {
      this.setState({redGloVetoggle:"redglovebutton-clicked", greenGloVetoggle: "greenglovebutton", votePetition: -1});
      votePetition.votePetition = -1;
      Parse.Cloud.run('handleVotePetition', votePetition);
    }
    else if (this.state.redGloVetoggle === "redglovebutton-clicked") {
      this.setState({redGloVetoggle:"redglovebutton", votePetition: 0});
      votePetition.votePetition = 0;
      Parse.Cloud.run('handleVotePetition', votePetition);
    }
  },
  handleShareButtonClick: function(e) {
    e.preventDefault();
    
    this.setState({
      shareButtonToggle: !this.state.shareButtonToggle
    });

  },

  render: function() {
    return (
      <div>
        <div>
          <div>
            <div className="petitionInfo">
              <div className="petitionHeading">
                Petition
              </div>
                
              <div className="petitionandid">
                <h3>Petition  <span className="petitionnumber">{this.state.petition.id}</span></h3>
              </div>
                
              <div className="petitionTagDescriptions">
                <p>Keywords: <span className="dynamic">{this.state.petition.keywords}</span></p>
              </div>
              <div className="petitionTagDescriptions">
                <p> <span className="dynamic">{this.state.petition.daysLeft}</span> Days left</p>
              </div>
          </div>
    
          <div className="petitionTabs">
            <ul>
              <li id="tab-1" onClick={this.handleTabClick.bind(this, 1)}>Topic</li>
              <li id="tab-2" onClick={this.handleTabClick.bind(this, 2)}>Summary</li>
              <li id="tab-3" onClick={this.handleTabClick.bind(this, 3)}>Neighbour comments</li>
            </ul>
    
          	<div className="box-wrap">
            	<div id="box">
            	  <p>{this.state.content}</p>
            	</div>
            </div>
          </div>
        
        </div>
        
        <div className="petitionChartContainer">
          <div className="petitionVoteComparison">
            <DoughnutChart className="petitionDoughnut" data={countryData} options={{animateRotate: true, animation: true, responsive: true}} width="200" height= "200" />
          </div>
        </div>
        
      <div className="legends">
          <h3 className="petitionNo">Disagree</h3>
          <h3 className="petitionGrey">Remaining</h3>
          <h3 className="petitionYes">Agree</h3>
      </div>
        
        <div className="votingAndSharingActions">
              
          <div onClick={this.handleRGloVeclick} className={this.state.redGloVetoggle}></div>

          <div className="share">
            <a className={this.state.shareButtonToggle ? "facebookButton fbtn share facebook fa-2x" : "hidden"} href="http://www.facebook.com/sharer/sharer.php?u=https://citizen-iblameyourmother.c9users.io/rep/helene-laverdiere"><i className="fa fa-facebook"></i></a>
            <i onClick={this.handleShareButtonClick} className= {"shareButton fa fa-share-alt fa-2x"}></i>
            <a className={this.state.shareButtonToggle ? "twitterButton fbtn share twitter fa-2x" : "hidden"} href="https://twitter.com/intent/tweet?text=test stuff&url=YOUR-URL&via=TWITTER-HANDLER"><i className="fa fa-twitter"></i></a>
          </div>

          <div onClick={this.handleGGloVeclick} className={this.state.greenGloVetoggle}></div>

        </div>
      </div>
  </div>
    );
  }
});

module.exports = withRouter(Petition);




//////TEXT TO BE ADDED TO INFO BUTTONS///////////

/*

ADDRESSEE

The petition must be addressed to one of the following:

“the House of Commons” or “the House of Commons in Parliament assembled”;
“the Government of Canada”;
a Minister of the Crown; or
a Member of the House of Commons.
Text

When creating a new petition, you will need to compose a text of no more than 250 words that identifies whom it is that you are addressing, and the specific request you are making of them, also called a “prayer,” to take or to avoid some concrete action in order to remedy a grievance.

The petition may also include a more detailed description of the grievance or a statement of opinion, but these alone cannot be received as a petition; a concrete, specific request must be included. The request must be clear and to the point, and phrased as a request and not as a demand.

The text of your e-petition may not include a URL, any other link or web-based reference. Any petition that includes such links will be rejected.



LANGUAGE

The petition must be respectful, use temperate language, and not contain improper or unparliamentary language. In particular, it should not contain disrespectful or offensive language with respect to the Crown, Parliament, or the courts. It may not include charges made against the character or conduct of Parliament, the courts, or any other duly-constituted authority. The e-petition must be written in either English or French.



SUBJECT OF THE PETITION

Federal jurisdiction
The petition must concern a subject that is within the authority of the Parliament of Canada, the House of Commons, or the Government of Canada. A petition must not concern a purely provincial or municipal matter.

Sub judice
The petition may not concern a matter that is sub judice, i.e. a matter that is the subject of legal proceedings or currently before the courts.

Similar petitions
Two e-petitions that are substantially the same may not be open for signature at the same time. An e-petitioner whose e-petition is substantially the same as another may wait for the first e-petition to close, or may amend his or her e-petition so as to make it distinctive. A search function is available on the website in order to identify exisiting e-petitions.*/