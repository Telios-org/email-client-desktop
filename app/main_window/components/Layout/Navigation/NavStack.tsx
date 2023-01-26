import React, { useRef } from 'react';
import { useSelector } from 'react-redux';

// EXTERNAL LIBRAIRIES
import { WifiIcon } from '@heroicons/react/solid';
import { QuestionMarkCircleIcon } from '@heroicons/react/outline';

// COMPOMENT IMPORT../TopBar/UserMenu
import NavIcon from './NavIcon';
import SupportMenu from './SupportMenu';

// ELECTRON LIBRAIRIES
const { ipcRenderer } = require('electron');

type Props = {
  active: string;
  onSelect: (eventKey: string) => void;
};

const NavStack = (props: Props) => {
  const { active, onSelect } = props;
  const onlineStatus = useSelector(state => state.globalState.status);

  return (
    <div className="relative flex flex-col w-13 border-gray-200 border-r overflow-visible">
      <div className="relative flex-1 flex flex-col min-h-0 overflow-y-aut pt-6">
        <nav
          aria-label="Sidebar"
          className="flex-1 flex-col items-center space-y-3"
        >
          <NavIcon active={active} eventKey="mail" onClick={onSelect} />
          <NavIcon active={active} eventKey="contacts" onClick={onSelect} />
        </nav>
        <div className="relative flex-shrink-0 flex flex-col pb-5 items-center justify-center">
          <SupportMenu />
          {onlineStatus === 'online' && (
            <WifiIcon className="h-5 w-5 text-purple-400" />  
          )}

          {onlineStatus === 'offline' && (
            <div className="h-5 w-5">
              <svg viewBox="0 0 19 18" version="1.1">
                <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                  <g id="Small" transform="translate(-631.000000, -530.000000)">
                    <g id="Group-2" transform="translate(631.000000, 531.073515)">
                        <g
                        id="Group"
                        transform="translate(0.000000, 1.926485)"
                        fill="#E0DCDC"
                        fillRule="nonzero">
                        <path d="M17.250712,5.22175 C12.954712,0.92575 5.99071202,0.92575 1.69471202,5.22175 C1.30233313,5.60072221 0.678627244,5.59530237 0.292893445,5.20956858 C-0.0928403531,4.82383478 -0.0982601888,4.20012889 0.280712021,3.80775 C5.35671202,-1.26925 13.588712,-1.26925 18.664712,3.80775 C19.0436842,4.20012889 19.0382644,4.82383478 18.6525306,5.20956858 C18.2667968,5.59530237 17.6430909,5.60072221 17.250712,5.22175 Z M14.422712,8.04975 C13.1099368,6.73684086 11.3293512,5.99924492 9.47271202,5.99924492 C7.61607283,5.99924492 5.8354872,6.73684086 4.52271202,8.04975 C4.13033313,8.42872221 3.50662724,8.42330237 3.12089345,8.03756858 C2.73515965,7.65183478 2.72973981,7.02812889 3.10871202,6.63575 C4.7965426,4.94789875 7.08574451,3.99967206 9.47271202,3.99967206 C11.8596795,3.99967206 14.1488814,4.94789875 15.836712,6.63575 C16.2156842,7.02812889 16.2102644,7.65183478 15.8245306,8.03756858 C15.4387968,8.42330237 14.8150909,8.42872221 14.422712,8.04975 L14.422712,8.04975 Z M11.592712,10.87975 C10.4212125,9.70860419 8.52221158,9.70860419 7.35071202,10.87975 C6.95997056,11.2704914 6.3264535,11.2704914 5.93571205,10.87975 C5.5449706,10.4890085 5.54497059,9.85549147 5.93571202,9.46475 C6.87343178,8.52678295 8.14540114,7.99981775 9.47171202,7.99981775 C10.7980229,7.99981775 12.0699923,8.52678295 13.007712,9.46475 C13.3984535,9.85549146 13.3984535,10.4890085 13.007712,10.87975 C12.6169706,11.2704914 11.9834535,11.2704915 11.592712,10.87975 L11.592712,10.87975 Z M8.47271202,12.99975 C8.47271202,12.4474653 8.92042727,11.99975 9.47271202,11.99975 L9.48271202,11.99975 C10.0349968,11.99975 10.482712,12.4474653 10.482712,12.99975 C10.482712,13.5520347 10.0349968,13.99975 9.48271202,13.99975 L9.47271202,13.99975 C8.92042727,13.99975 8.47271202,13.5520347 8.47271202,12.99975 Z" id="Shape" />
                      </g>
                        <rect
                        id="Rectangle"
                        stroke="#FFFFFF"
                        strokeWidth="0.5"
                        fill="#C08DF6"
                        transform="translate(9.292944, 7.920210) rotate(50.000000) translate(-9.292944, -7.920210) "
                        x="-0.207056289"
                        y="6.92020982"
                        width="19"
                        height="2"
                        rx="1"
                      />
                      </g>
                  </g>
                </g>
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavStack;
