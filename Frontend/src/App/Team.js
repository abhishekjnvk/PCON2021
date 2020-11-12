import React, { Component } from "react";
import "semantic-ui-css/semantic.min.css";
import { message, Input } from "antd";
import Cookies from "universal-cookie";
import { Dimmer, Loader, Dropdown } from "semantic-ui-react";
import { UserAddOutlined } from "@ant-design/icons";
import "../style.css";
import swal from "sweetalert";

const cookies = new Cookies();
const { Search } = Input;

class Team extends Component {
  state = {
    data: [],
    value: undefined,
    fetched: 0,
    member_fetched: 1,
    selected_team: undefined,
    team_member: [],
    redirect: false,
    isAdmin: false,
  };

  fetchTeam = () => {
    message.loading({ content: "Fetching Team list", key: "loadingTeam" });
    var requestOptions = {
      method: "GET",
      redirect: "follow",
    };
    var token = cookies.get("webtoken");
    fetch(`https://caleder-app-backend.herokuapp.com/myteam?token=${token}`, requestOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log(result);
        this.setState({ fetched: 1 });
        var course_taught = [];
        if (!result.data.length) {
          message.warning({
            content: "You are not in any team please create a team",
            key: "loadingTeam",
            duration: 1,
          });
        } else {
          result.data.map((data) => {
            course_taught.push({
              key: data.team_id,
              text: data.team_id,
              value: data.team_id,
            });
            return true;
          });
          this.setState({ data: course_taught });
          message.destroy();
        }
      })
      .catch((error) => console.log("error", error));
  };
  onAdd = (value) => {
    if (value) {
      message.loading({ content: "Adding User", key: "addingUser" });

      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      var token = cookies.get("webtoken");
      fetch(
        `https://caleder-app-backend.herokuapp.com/add_user?team_id=${this.state.selected_team}&email=${value}&right=member&token=${token}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          if (result.status) {
            message.success({
              content: "User Added",
              key: "addingUser",
              duration: 3,
            });
            this.setState({
              member_fetched: this.state.member_fetched * -1,
            });
          } else {
            message.warning({
              content: result.response,
              key: "addingUser",
              duration: 5,
            });
          }
        })
        .catch((error) => console.log("error", error));
    }
  };

  fetchMembers = () => {
    if (this.state.selected_team) {
      var requestOptions = {
        method: "GET",
        redirect: "follow",
      };
      var token = cookies.get("webtoken");
      fetch(
        `https://caleder-app-backend.herokuapp.com/getTeamMember?team_id=${this.state.selected_team}&token=${token}`,
        requestOptions
      )
        .then((response) => response.json())
        .then((result) => {
          console.log(result);
          this.setState({ team_member: result.data, isAdmin: result.isAdmin });
          this.setState({ member_fetched: 1 });
          console.log(this.state.team_member);
        })
        .catch((error) => console.log("error", error));
    }
  };
  handleChange = (value) => {
    this.setState({ value });
  };
  deleteTeam=()=>{
    var token = cookies.get("webtoken");

    swal({
      title: "Are you sure?",
      text:
        "Once deleted, you will not be able to recover team event and team data. Please create a backup of data",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    }).then((willDelete) => {
      if (willDelete) {
        var requestOptions = {
          method: "GET",
          redirect: "follow",
        };
        fetch(
          `https://caleder-app-backend.herokuapp.com/deleteTeam?team_id=${this.state.selected_team}&token=${token}`,
          requestOptions
        )
          .then((response) => response.json())
          .then((result) => {
            console.log(result);
            if(result.status){
              swal("Deleted", {
                icon: "success",
              });
              this.setState({fetched:0})
            }
          })
          .catch((error) => console.log("error", error));
      }
    });
  }
  render() {
    // console.log(this.props.match.params.id);
    if (!(this.state.member_fetched === 1)) {
      this.fetchMembers();
    }
    if (!(this.state.fetched === 1)) {
      this.fetchTeam();
      return <></>;
    } else {
      return (
        <>
          <div className="col-lg-2 mx-auto mt-2 text-center">
            <Dropdown
              placeholder="Select Team"
              fluid
              search
              selection
              options={this.state.data}
              onChange={(e, data) => {
                this.setState({ selected_team: data.value });
                this.setState({
                  member_fetched: this.state.member_fetched * -1,
                });
              }}
              style={{fontSize:"1.12em"}}
            />
          </div>

          {this.state.selected_team ? (
            <div className="col-lg-3 mx-auto mt-4 shadow-lg p-3 mb-5 bg-white rounded">
              {this.state.member_fetched === -1 ? (
                <Dimmer active>
                  <Loader />
                </Dimmer>
              ) : (
                <>
                  <b className="mt-4">
                    <center>{this.state.selected_team_name}</center>
                  </b>
                  {this.state.isAdmin ? (
                    <>
                      <button
                        className="btn btn-sm float-right btn-danger"
                        onClick={this.deleteTeam}
                      >
                        Delete Team
                      </button>
                      <label>Add Member</label>
                      <Search
                        placeholder="Enter Email to add user"
                        enterButton={<UserAddOutlined />}
                        size="large"
                        onSearch={this.onAdd}
                      />
                      <br />
                      <br />
                    </>
                  ) : null}

                  <center>
                    <b>Member List</b>
                  </center>
                  <br />
                  {this.state.team_member.map((value, key) => (
                    <p>
                      {key + 1}.) {value.email}&nbsp;({value.right})
                    </p>
                  ))}
                </>
              )}
            </div>
          ) : null}
        </>
      );
    }
  }
}

export default Team;
