import React, { useState, useEffect } from "react";

// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Navbar,
  Nav,
  Table,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import Web3 from "web3";
import Patient from "../build/Patient";

function TableList() {
  // State to hold the table data
  const [data, setData] = useState([]);
    const [state, setState] = useState({
      patient: null,
      account: null,
      supplyChain: null,
      identicon: null,
      loading: true,
      web3: null,
    });
    const [files, setFiles] = useState([]);

    const viewUploadedFiles = async() => {
      console.log(state)
      var patient = await state.patient.methods.patients(state.account).call();
      var count = patient.fileCount;
      console.log(count)
      let f = []
      for (var i = 0; i < count; i++) {
          const file = await state.patient.methods.files(state.account, i).call()
          console.log(file)
          file["id"] = i + 1;
          file["link"] = 'http://localhost:8080/ipfs/' + file["fileHash"];
          f.push(file)
          setFiles((prev) => [...prev, file]);
      }
      console.log(files)
      console.log(f[0]["fileName"])
      populateData(f);
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

  // Function to populate data (called before the page renders)
  const populateData = async (fetchedData) => {
    console.log(fetchedData)
    // Example static data or you can fetch data from an API
     

    // Simulate an API call and then set data
    setData(fetchedData);
  };

  // UseEffect to call the populateData function before the page renders
  useEffect(() => {
    populateData();
  }, []); // Empty dependency array means this runs once when the component mounts
  
  if (!data || data.length == 0) {
    return <h1>Loading...</h1>
  } else {
  return (
    <>
      <Container fluid>
        <Row>
          <Col md="12">
            <Card className="strpied-tabled-with-hover">
              {/* <Card.Header>
                <Card.Title as="h4">Striped Table with Hover</Card.Title>
                <p className="card-category">Here is a subtitle for this table</p>
              </Card.Header> */}
              <Card.Body className="table-full-width table-responsive px-0">
                <Table className="table-hover table-striped">
                  <thead>
                    <tr>
                      <th className="border-0">ID</th>
                      <th className="border-0">File Name</th>
                      <th className="border-0">Date Uploaded</th>
                      {/* <th className="border-0">File Hash</th> */}
                      <th className="border-0">View File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row) => (
                      <tr key={row.id}>
                        <td>{row.id}</td>
                        <td>{row.fileName}</td>
                        <td>{row.datetime}</td>
                        {/* <td>{row.fileHash}</td> */}
                        <td><a href={row.link}>View</a></td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
}
}

export default TableList;
