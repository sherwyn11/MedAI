import React, { useState, useEffect } from "react";
import ChartistGraph from "react-chartist";
import "bootstrap/dist/css/bootstrap.min.css";
import Patient from '../build/Patient.json';

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  ProgressBar,
  Nav,
  Table,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import axios from "axios";
import Web3 from "web3";

function Dashboard() {
// State for Fitbit API data
const [fitbitData, setFitbitData, setCaloriesBurned] = useState(null);
// const [error, setError] = useState("");

// Fitbit OAuth Config
const CLIENT_ID = "23Q5R5";
const REDIRECT_URI = "http://localhost:3000/admin/dashboard";
const AUTH_URL = `https://www.fitbit.com/oauth2/authorize?response_type=token&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=activity%20heartrate%20profile`;

// Handle Fitbit OAuth login
const handleFitbitLogin = () => {
  window.location.href = AUTH_URL; // Redirect to Fitbit OAuth
};

// Extract access token when the component mounts
useEffect(() => {
  if (window.location.hash) {
    handleTokenExtraction();
  }
}, []);

// Extract token from URL and fetch data
const handleTokenExtraction = () => {
  const urlParams = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = urlParams.get("access_token");

  if (accessToken) {
    fetchFitbitData(accessToken);
  }
};

// Fetch Fitbit Data from API
const fetchFitbitData = (token) => {
  const apiUrl = "https://api.fitbit.com/1/user/-/activities.json"; // Example endpoint

  fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => response.json())

    .then((data) => {
      setFitbitData(data);
      setCaloriesBurned(data?.summary?.caloriesOut || 0); // Extract calories
      setError(""); // Clear errors
    })
    .catch((err) => {
      console.error("Error fetching Fitbit data:", err);
      setError("Failed to fetch Fitbit data.");
    });
};

// Extract Active Step Performance from Fitbit Data
const getActiveSteps = () => {
  return fitbitData?.lifetime?.total?.steps || 0;
};

const getCaloriesBurned = () => {
  return fitbitData?.summary?.caloriesOut || 0; // Extract calories burned, fallback to 0 if not available
};


// Define the target step goal (e.g., 10,000 steps per day)
const STEP_GOAL = 10000;
const stepsCovered = getActiveSteps();
const progressPercentage = Math.min((stepsCovered / STEP_GOAL) * 100, 100); // Limit to 100%
const circleRadius = 60; // Radius of the progress circle
const circleCircumference = 2 * Math.PI * circleRadius; // Total length of the stroke
const progressStroke = (progressPercentage / 100) * circleCircumference; // Filled stroke length
const CALORIE_GOAL = 500; // Set a goal for calories burned, adjust as necessary
const caloriesBurned = getCaloriesBurned(); // Function that fetches calories burned from fitbitData
const calorieProgressPercentage = Math.min((caloriesBurned / CALORIE_GOAL) * 100, 100); // Limit to 100%
const calorieCircleRadius = 60; // Radius of the progress circle for calories
const calorieCircleCircumference = 2 * Math.PI * calorieCircleRadius; // Total length of the stroke for calories
const calorieStroke = (calorieProgressPercentage / 100) * calorieCircleCircumference; // Filled stroke length for calories


  
  const [fileName, setFileName] = useState("");
  const [filePreview, setFilePreview] = useState("");
  const [error, setError] = useState("");
  let [file, setFile] = useState(null);
  const [state, setState] = useState({
    patient: null,
    account: null,
    supplyChain: null,
    identicon: null,
    loading: true,
    web3: null,
  });
  const [files, setFiles] = useState([]);


  const handleFileChange = (event) => {
    file = event.target.files[0];
    setFile(event.target.files[0]);
  };
  const handleFileUpload = (event) => {
    console.log(state)
    event.preventDefault();
    const data = new FormData(); 
    data.append('file', file);
    axios.post("http://127.0.0.1:5002/upload", data, {
    }).then(function(response) { 
        console.log(response.data);
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); 
        let yyyy = today.getFullYear();
        today = dd + '/' + mm + '/' + yyyy;
        console.log(state)
        state.patient.methods.saveFile(file.name, response.data["Hash"], today).send({ from: state.account })
        .once('receipt', (receipt) => {
            console.log(receipt);
            viewUploadedFiles();
        })
    })
  };

  const viewUploadedFiles = async() => {
    console.log(state)
    var patient = await state.patient.methods.patients(state.account).call();
    var count = patient.fileCount;
    console.log(count)
    let f = []
    for (var i = 0; i < count; i++) {
        const file = await state.patient.methods.files(state.account, i).call()
        console.log(file)
        f.push(file)
        setFiles((prev) => [...prev, file]);
    }
    console.log(files)
    console.log(f)
  }

  useEffect(() => {
    const init = async () => {
      await loadWeb3();
      await loadBlockChain();

    };

    init();

    const fileInput = document.querySelector(".custom-file-input");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        let fileName = this.files[0] ? this.files[0].name : "Choose file";
        this.nextElementSibling.innerText = fileName;
      });
    }

  }, []);

  useEffect(() => {
    console.log(state)
    if (state.patient != null) {
      viewUploadedFiles();
    }
  }, [state.patient]);


  const loadWeb3 = async () => {
      if (window.ethereum) {
          window.web3 = new Web3(window.ethereum)
          await window.ethereum.enable()
      }
      else if (window.web3) {
          window.web3 = new Web3(window.web3.currentProvider)
      }
      else {
          window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
  }

  const handleInputChange = (e) => {
      setState({
          [e.target.id]: e.target.value,
      })
  }

  const loadBlockChain = async () => {
      const web3 = window.web3
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await web3.eth.getAccounts()
      console.log(accounts)
      setState((prev) => ({ ...prev, 'account': accounts[0] }))
      const networkId = await web3.eth.net.getId()
      const networkData = Patient.networks[networkId]
      if(networkData) {
          const patient = new web3.eth.Contract(Patient.abi, networkData.address)
          setState((prev) => ({ ...prev,'patient': patient, 'loading': false }))
    console.log(state)

      } else {
          window.alert('Patient contract not deployed to detected network.')
      }
  }

  return (
      <Container fluid>
        <Row>
          <Col lg="6" sm="12">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="3">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-chart text-warning"></i>
                    </div>
                  </Col>
                  <Col>
                    <p className="card-category mb-2">Upload Medical Record</p>
                    <div className="input-group">
                      <div className="custom-file">
                        <input
                          type="file"
                          className="custom-file-input"
                          id="file-upload"
                          onChange={handleFileChange}
                        />
                        <label
                          className="custom-file-label"
                          htmlFor="file-upload"
                        >
                          Choose file
                        </label>
                      </div>
                      <Button
                        variant="primary"
                        as="label"
                        htmlFor="file-upload"
                        onClick={handleFileUpload}
                        style={{ padding: "5px 12px" }}
                      >
                        Upload
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i>
                  Update Now
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-vector text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Calories Burnt</p>
                      <Card.Title as="h4">23</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock-o mr-1"></i>
                  In the last hour
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-favourite-28 text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Avg. Heart Rate</p>
                      <Card.Title as="h4">75</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock-o mr-1"></i>
                  In the last hour
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Heart Rate</Card.Title>
                <p className="card-category">24 Hours performance</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartHours">
                  <ChartistGraph
                    data={{
                      labels: [
                        "9:00AM",
                        "12:00AM",
                        "3:00PM",
                        "6:00PM",
                        "9:00PM",
                        "12:00PM",
                        "3:00AM",
                        "6:00AM",
                      ],
                      series: [
    Array.from({ length: 8 }, () => Math.floor(Math.random() * (100 - 60 + 1)) + 60),  // Person 1
                      ],
                    }}
                    type="Line"
                    options={{
                      low: 50,
                      high: 120,
                      showArea: false,
                      height: "245px",
                      axisX: {
                        showGrid: false,
                      },
                      lineSmooth: true,
                      showLine: true,
                      showPoint: true,
                      fullWidth: true,
                      chartPadding: {
                        right: 50,
                      },
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <hr></hr>
                <div className="stats">
                  <i className="fas fa-history"></i>
                  Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Sleep Statistics</Card.Title>
                <p className="card-category">Sleep Patterns Over the Last Week</p>
              </Card.Header>
              <Card.Body>
                <div
                  className="ct-chart ct-perfect-fourth"
                  id="chartPreferences"
                >
                  <ChartistGraph
                    data={{
                      // labels: ["Good Sleep", "Average Sleep", "Poor Sleep"],
                      series: [60, 30, 10],  // Percentages of sleep quality
                    }}
                    type="Pie"
                  />
                </div>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i> Good Sleep
                  <i className="fas fa-circle text-warning"></i> Average Sleep
                  <i className="fas fa-circle text-danger"></i> Poor Sleep
                </div>
                <hr></hr>
                <div className="stats">
                  <i className="far fa-clock"></i>
                  Last sleep data updated 2 hours ago
                </div>
              </Card.Body>
            </Card>

          </Col>
        </Row>
        <Row>
          <Col md="6">
  <Card>
    <Card.Header>
      <Card.Title as="h4">Yearly Calories Burned</Card.Title>
      <p className="card-category">Running vs Cycling</p>
    </Card.Header>
    <Card.Body>
      <div className="ct-chart" id="chartActivity">
        <ChartistGraph
          data={{
            labels: [
              "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ],
            series: [
              [
                1200, 1450, 1800, 2000, 2100, 2300, 2500, 2400, 2200, 2100, 2000, 1900, // Running
              ],
              [
                800, 1000, 1200, 1500, 1600, 1700, 1900, 1800, 1600, 1500, 1400, 1300, // Cycling
              ],
            ],
          }}
          type="Bar"
          options={{
            seriesBarDistance: 10,
            axisX: {
              showGrid: false,
            },
            height: "245px",
          }}
          responsiveOptions={[
            [
              "screen and (max-width: 640px)",
              {
                seriesBarDistance: 5,
                axisX: {
                  labelInterpolationFnc: function (value) {
                    return value[0];
                  },
                },
              },
            ],
          ]}
        />
      </div>
    </Card.Body>
    <Card.Footer>
      <div className="legend">
        <i className="fas fa-circle text-info"></i>
        Running <i className="fas fa-circle text-danger"></i>
        Cycling
      </div>
      <hr></hr>
      <div className="stats">
        <i className="fas fa-check"></i>
        Health data certified
      </div>
    </Card.Footer>
  </Card>
</Col>

          <Col md="6">
  <Card className="card-tasks">
    <Card.Header>
      <Card.Title as="h4">Health Tasks</Card.Title>
      <p className="card-category">Health and Wellness</p>
    </Card.Header>
    <Card.Body>
      <div className="table-full-width">
        <Table>
          <tbody>
            <tr>
              <td>
                <Form.Check className="mb-1 pl-0">
                  <Form.Check.Label>
                    <Form.Check.Input
                      defaultValue=""
                      type="checkbox"
                    ></Form.Check.Input>
                    <span className="form-check-sign"></span>
                  </Form.Check.Label>
                </Form.Check>
              </td>
              <td>
                Drink 8 glasses of water
              </td>
              <td className="td-actions text-right">
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-488980961">
                      Edit Task..
                    </Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="info"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-506045838">Remove..</Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="danger"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
            <tr>
              <td>
                <Form.Check className="mb-1 pl-0">
                  <Form.Check.Label>
                    <Form.Check.Input
                      defaultChecked
                      defaultValue=""
                      type="checkbox"
                    ></Form.Check.Input>
                    <span className="form-check-sign"></span>
                  </Form.Check.Label>
                </Form.Check>
              </td>
              <td>
                Walk 10,000 steps
              </td>
              <td className="td-actions text-right">
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-537440761">
                      Edit Task..
                    </Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="info"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-21130535">Remove..</Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="danger"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
            <tr>
              <td>
                <Form.Check className="mb-1 pl-0">
                  <Form.Check.Label>
                    <Form.Check.Input
                      defaultChecked
                      defaultValue=""
                      type="checkbox"
                    ></Form.Check.Input>
                    <span className="form-check-sign"></span>
                  </Form.Check.Label>
                </Form.Check>
              </td>
              <td>
                Do 30 minutes of cardio
              </td>
              <td className="td-actions text-right">
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-577232198">
                      Edit Task..
                    </Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="info"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-773861645">Remove..</Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="danger"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
            <tr>
              <td>
                <Form.Check className="mb-1 pl-0">
                  <Form.Check.Label>
                    <Form.Check.Input
                      defaultChecked
                      type="checkbox"
                    ></Form.Check.Input>
                    <span className="form-check-sign"></span>
                  </Form.Check.Label>
                </Form.Check>
              </td>
              <td>
                Meditate for 15 minutes
              </td>
              <td className="td-actions text-right">
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-422471719">
                      Edit Task..
                    </Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="info"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-829164576">Remove..</Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="danger"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
            <tr>
              <td>
                <Form.Check className="mb-1 pl-0">
                  <Form.Check.Label>
                    <Form.Check.Input
                      defaultValue=""
                      type="checkbox"
                    ></Form.Check.Input>
                    <span className="form-check-sign"></span>
                  </Form.Check.Label>
                </Form.Check>
              </td>
              <td>
                Eat 5 servings of vegetables
              </td>
              <td className="td-actions text-right">
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-160575228">
                      Edit Task..
                    </Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="info"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-922981635">Remove..</Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="danger"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
            <tr>
              <td>
                <Form.Check className="mb-1 pl-0">
                  <Form.Check.Label>
                    <Form.Check.Input
                      defaultValue=""
                      disabled
                      type="checkbox"
                    ></Form.Check.Input>
                    <span className="form-check-sign"></span>
                  </Form.Check.Label>
                </Form.Check>
              </td>
              <td>
                Unfollow unhealthy habits
              </td>
              <td className="td-actions text-right">
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-938342127">
                      Edit Task..
                    </Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="info"
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger
                  overlay={
                    <Tooltip id="tooltip-119603706">Remove..</Tooltip>
                  }
                >
                  <Button
                    className="btn-simple btn-link p-1"
                    type="button"
                    variant="danger"
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    </Card.Body>
    <Card.Footer>
      <hr></hr>
      <div className="stats">
        <i className="now-ui-icons loader_refresh spin"></i>
        Updated 3 minutes ago
      </div>
    </Card.Footer>
  </Card>
</Col>
<Col>
<Card
  className="shadow-lg rounded-4 text-center text-white"
  style={{
    maxWidth: "500px", // Increased the width to make the card rectangular
    width: "100%",
    background: "linear-gradient(to right, #141e30, #243b55)",
    margin: "0 auto", // Center the card horizontally
  }}
>
  <Card.Body className="p-4">
    <h2 className="fw-bold mb-3">🏃 Fitbit Tracker</h2>

    {/* Fitbit Login Button */}
    <Button
      onClick={handleFitbitLogin}
      className="w-100 mb-4 fw-semibold"
      style={{
        background: "linear-gradient(to right, #27AE60, #219653)",
        border: "none",
        color: "white",
      }}
    >
      Connect to Fitbit
    </Button>

    {/* Step Meter */}
    {fitbitData ? (
      <div className="d-flex justify-content-center align-items-center">
        {/* Steps Circular Meter */}
        <div className="d-flex justify-content-center align-items-center flex-column">
          <svg width="140" height="140" viewBox="0 0 160 160" className="position-relative">
            {/* Background Circle */}
            <circle
              cx="80"
              cy="80"
              r={circleRadius}
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="12"
            />
            {/* Progress Circle */}
            <circle
              cx="80"
              cy="80"
              r={circleRadius}
              fill="none"
              stroke="#27AE60"
              strokeWidth="12"
              strokeDasharray={circleCircumference}
              strokeDashoffset={circleCircumference - progressStroke}
              strokeLinecap="round"
              transform="rotate(-90 80 80)"
            />
            {/* Step Count Display */}
            <text x="80" y="85" textAnchor="middle" fontSize="20" fill="white" fontWeight="bold">
              {stepsCovered}
            </text>
            <text x="80" y="110" textAnchor="middle" fontSize="12" fill="white">
              steps
            </text>
          </svg>
          <p className="mt-3">Goal: <strong>{STEP_GOAL} steps</strong></p>
        </div>
      </div>
    ) : error ? (
      <div>
        <p className="text-danger fw-semibold">{error}</p>
        <Button variant="danger" onClick={handleFitbitLogin}>Retry</Button>
      </div>
    ) : (
      <p className="text-white-50">⌛ Waiting for Fitbit data...</p>
    )}
  </Card.Body>
</Card>



</Col>
</Row>

        
  </Container>
  );
}

export default Dashboard;
