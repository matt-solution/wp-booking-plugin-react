import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const ConvertText = ({ content, limit }) => {
    const { t } = useTranslation();
    const [showAll, setShowAll] = useState(false);
  
    const showMore = () => setShowAll(true);
    const showLess = () => setShowAll(false);
  
    if (content?.length <= limit) {
      return <div>{content}</div>;
    }
    if (showAll) {
      return (
        <div>
          {content}
          <button className="order-detail-read-less" onClick={showLess}>
            {t("readless")}
          </button>
        </div>
      );
    }
    const toShow = content?.substring(0, limit) + "...";
    return (
      <div>
        {toShow}
        <button className="order-detail-read-more" onClick={showMore}>
          {t("readmore")}
        </button>
      </div>
    );
  };

  export default ConvertText;