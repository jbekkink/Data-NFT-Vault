import toast from 'react-hot-toast';

function loadingNotif(text) {
    toast.loading(text, {position: 'bottom-right' , 
    style: {
        background: '#0e0e0e',
        color: 'white',
        border: '1px solid white'
    },
    iconTheme: {
        primary: '#FFEA61',
        secondary: '#202020',
    },
  });
}

function uploadSuccessful(text) {
    toast.success(text, {position: 'top-right' , 
    style: {
        background: '#0e0e0e',
        color: 'white',
        border: '1px solid white',
        padding: '1.5em',
        borderRadius: '5px'
        },
        iconTheme: {
            primary: '#FFEA61',
            secondary: '#202020',
          },
          duration: 3000,
        
    });
}

function uploadFailed(text) {
    toast.error(text, {position: 'top-right' , 
    style: {
        background: '#0e0e0e',
        color: 'white',
        border: '1px solid white',
        padding: '1.5em',
        borderRadius: '5px'
        },
        duration: 8000,
    });
}

function copyToClipBoard(text) {
    toast(text, {
        id: 'clipboard',
        position: 'bottom-right',
        style: {
            background: '#202020',
            display: 'block',
            color: 'white',
            border: '1px solid white',
            padding: '0.5em',
            borderRadius: '5px'
        }, 
        duration: 750
      });
}



export {uploadSuccessful, loadingNotif, uploadFailed, copyToClipBoard};