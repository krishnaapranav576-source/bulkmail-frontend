import { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

function App() {

  const [subject, setsubject] = useState("");
  const [msg, setmsg] = useState("");
  const [emailList, setemailList] = useState([]);
  const [status, setstatus] = useState(false);

  function handlefile(event) {

    const file = event.target.files[0];

    const reader = new FileReader();

    reader.onload = function (e) {

      const data = e.target.result;

      const workbook = XLSX.read(data, { type: "binary" });

      const sheet = workbook.SheetNames[0];

      const worksheet = workbook.Sheets[sheet];

      const list = XLSX.utils.sheet_to_json(worksheet, { header: "A" });

      const emails = list.map(item => item.A);

      setemailList(emails);

    };

    reader.readAsBinaryString(file);
  }

  function send() {

    setstatus(true);

    axios.post("https://bulkmail-backend-hdcs.onrender.com/sendemail", {
      subject,
      msg,
      emailList,
    })
      .then(res => {

        if (res.data === true) {
          alert("Mail sent");
        } else {
          alert("Failed");
        }

        setstatus(false);

      });

  }

  return (

    <div className="min-h-screen bg-blue-100">

      <div className="bg-blue-900 text-white text-center p-4 text-2xl font-bold">
        Bulk Mail App
      </div>

      <div className="max-w-2xl mx-auto mt-6 bg-white p-6 rounded shadow">

        <input
          placeholder="Subject"
          className="w-full border p-2 mb-3"
          onChange={(e) => setsubject(e.target.value)}
        />

        <textarea
          placeholder="Email Body"
          className="w-full border p-2 mb-3 h-32"
          onChange={(e) => setmsg(e.target.value)}
        />

        <input
          type="file"
          onChange={handlefile}
          className="mb-3"
        />

        <p>Total Emails: {emailList.length}</p>

        <button
          onClick={send}
          className="bg-blue-900 text-white px-4 py-2 mt-3"
        >
          {status ? "Sending..." : "Send Mail"}
        </button>

      </div>

    </div>

  );
}

export default App;