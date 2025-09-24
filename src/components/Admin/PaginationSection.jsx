import { Pagination } from "react-bootstrap";

const PaginationSection = ({ pageNumber, pageSize, totalItems, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  const startItem = (pageNumber - 1) * pageSize + 1;
  const endItem = Math.min(startItem + pageSize - 1, totalItems);

  return (
    <div className="d-flex justify-content-between align-items-center mt-3">
      {/* Text hiển thị range */}
      <small className="text-muted">
        Showing {startItem}-{endItem} of {totalItems}
      </small>

      {/* Nút pagination */}
      <Pagination className="mb-0">
        <Pagination.First
          onClick={() => onPageChange(1)}
          disabled={pageNumber === 1}
        />
        <Pagination.Prev
          onClick={() => onPageChange(pageNumber - 1)}
          disabled={pageNumber === 1}
        />

        {[...Array(totalPages)].map((_, index) => (
          <Pagination.Item
            key={index + 1}
            active={pageNumber === index + 1}
            onClick={() => onPageChange(index + 1)}
          >
            {index + 1}
          </Pagination.Item>
        ))}

        <Pagination.Next
          onClick={() => onPageChange(pageNumber + 1)}
          disabled={pageNumber === totalPages}
        />
        <Pagination.Last
          onClick={() => onPageChange(totalPages)}
          disabled={pageNumber === totalPages}
        />
      </Pagination>
    </div>
  );
};

export default PaginationSection;
