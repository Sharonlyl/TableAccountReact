import React from 'react';
import { Col, Row } from 'antd';
import { useMemo } from 'react';
import CSSLogo from '../../../assets/images/css-logo.png';
import FILLogo from '../../../assets/images/fil_logo_en_2021.65aef40f.png';

const Footer = () => {
  const currentYear = useMemo(() => {
    return new Date().getFullYear();
  }, []);

  return (
    <div className="container footer">
      <Row justify="center" align="middle" style={{ marginBottom: '5px' }}>
        <Col>
          <img src={CSSLogo} height="31px" />
        </Col>
        <Col>&nbsp;&nbsp;</Col>
        <Col>
          <img src={FILLogo} height="31px" />
        </Col>
      </Row>
      <Row justify="center">
        <Col>
          <div style={{ textAlign: 'center' }}>
            <small>
              &copy; <span id="commonFooterCurrentYear">{currentYear}</span> FIL Investment Management (Hong Kong) Limited. All rights reserved. <br />
              Support by&nbsp;
              <a href="mailto:FIL-DALIAN-HK-CSS-TECH-SUPPORT@fil.com?subject=[HKCSS] Service Request - ">
                FIL - DALIAN-HK-CSS-TECH-SUPPORT
              </a>
            </small>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default Footer;