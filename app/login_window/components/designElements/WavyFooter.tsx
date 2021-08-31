import React from 'react';

type Props = {
    className?: string;
  };

const WavyFooter = function(props: Props) {
  const { className = '' } = props;
  return (
    <div className={className}>
<svg width="400px" height="46px" viewBox="0 0 400 46" version="1.1" xmlns="http://www.w3.org/2000/svg">
    <title>WavyFooter</title>
    <defs>
        <linearGradient x1="18.2339105%" y1="50.1860294%" x2="137.899587%" y2="49.2650334%" id="linearGradient-WF1">
            <stop stopColor="#A996FF" offset="0%"></stop>
            <stop stopColor="#25C3FF" offset="100%"></stop>
        </linearGradient>
        <path d="M0.0170480152,29.0017962 C10.9404391,23.2167546 31.4087713,15.960039 61.4220446,7.23164934 C73.9631615,4.63383292 85.7627694,2.57779226 96.9092559,1.0003372 C96.9209613,0.998680641 96.9319291,0.995435614 96.94437,0.995369116 C98.7297319,0.985826185 204.386547,0.985826185 204.931195,0.995369116 C205.007256,0.9967018 204.897254,0.985826185 204.967164,0.997643575 C264.091177,10.9918271 303.7545,35.6560068 370.22955,41.9091509 C381.118114,42.9334113 390.995549,43.8495076 399.936723,44.6599847 C400.151397,44.6794439 400,44.7459329 400,44.6599847 C400,36.1124742 400,38.0094333 399.936723,1 L-0.000887646316,0.995369116 C-0.000887646316,19.1018901 -0.000887646316,28.4402747 -0.000887646316,29.0105229 C-0.000887646316,29.0132369 0.011038067,29.0049791 0.0170480152,29.0017962 Z" id="path-WF2"></path>
        <filter x="-1.5%" y="-13.7%" width="103.0%" height="127.5%" filterUnits="objectBoundingBox" id="filter-WF3">
            <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
            <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
            <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.317408422 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
    </defs>
    <g id="Page-1Footer" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="WaveFooter" transform="translate(0.000000, -529.000000)" fillRule="nonzero">
            <g id="GroupFooter" transform="translate(-1.000000, 532.000000)">
                <g id="PathFooter" transform="translate(200.500000, 23.500000) scale(-1, -1) translate(-200.500000, -23.500000) translate(0.000000, 1.000000)">
                    <use fill="black" fillOpacity="1" filter="url(#filter-WF3)" href="#path-WF2"></use>
                    <use fill="url(#linearGradient-WF1)" href="#path-WF2"></use>
                </g>
            </g>
        </g>
    </g>
</svg>
    </div>
    );
}

WavyFooter.defaultProps = {
  className: ''
};

export default WavyFooter;
