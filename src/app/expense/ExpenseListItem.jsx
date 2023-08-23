import React from "react";
import { Card } from "primereact/card";
import * as dayjs from "dayjs";

const ExpenseListItem = (props) => {
  const itemDetail = props.itemDetail;

  return (
    <Card>
      <div>
        <div
          className=""
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          {itemDetail.description}

          <div className="color-title">
            {itemDetail.amount.toLocaleString()}.
          </div>
        </div>
        <div
          className="color-title"
          style={{ fontSize: 14, fontWeight: "bold" }}
        >
          {itemDetail.label_name}
        </div>
        <div className="color-title" style={{ fontSize: 14 }}>
          {itemDetail.wallet_name}
        </div>
        <div className="color-title" style={{ fontSize: 12 }}>
          {dayjs(itemDetail.date).format("YYYY-MM-DD hh:mma")}
        </div>
      </div>
    </Card>
  );
};

export default React.memo(ExpenseListItem);
