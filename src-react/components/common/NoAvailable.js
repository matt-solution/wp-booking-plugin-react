import React from "react";
import { useTranslation } from 'react-i18next';

const NoAvailable = (props) => {
    const { t } = useTranslation();
    return (
        <div className="no-available-product text-center p-5">
            {t('noavailable.noavail')}
        </div>
    );
}

export default NoAvailable;
