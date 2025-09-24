import React from "react";
import { Table, Button } from "react-bootstrap";

export default function PostsManager() {
  return (
    <div>
      <h3 className="mb-3">Post Management</h3>
      <Button variant="primary" className="mb-3" style={{ background: "#84b4c8", border: "none" }}>
        + Add Post
      </Button>
      <Table bordered hover>
        <thead>
          <tr>
            <th>#</th>
            <th>Title</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>Hello World</td>
            <td>2025-09-24</td>
            <td>
              <Button size="sm" variant="warning" className="me-2">Edit</Button>
              <Button size="sm" variant="danger">Delete</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
