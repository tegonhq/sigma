import { observer } from "mobx-react-lite";
import React from "react";

import { Day } from "./day";

export const MyDay = observer(() => {
  return (
    <div className="flex flex-col h-full relative">
      <Day />
    </div>
  );
});
