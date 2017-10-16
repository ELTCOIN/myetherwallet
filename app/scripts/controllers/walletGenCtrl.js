'use strict';
var walletGenCtrl = function($scope) {
    $scope.password = "";
    $scope.wallet = null;
    $scope.showWallet = false;
    $scope.blob = $scope.blobEnc = "";
    $scope.isDone = true;
    $scope.showPass = true;
    $scope.fileDownloaded = false;
    $scope.showPaperWallet = false;
    $scope.showGetAddress = false;
    $scope.genNewWallet = function() {
        if (!$scope.isStrongPass()) {
            $scope.notifier.danger(globalFuncs.errorMsgs[1]);
            globalFuncs.callNativeApp(globalFuncs.WALLET_EVENTS.NEW_WALLET_ERR, globalFuncs.errorMsgs[1]);
        } else if ($scope.isDone) {
            $scope.wallet = $scope.blob = $scope.blobEnc = null;
            if (!$scope.$$phase) $scope.$apply();
            $scope.isDone = false;
            $scope.wallet = Wallet.generate(false);
            $scope.showWallet = true;
            $scope.blob = globalFuncs.getBlob("text/json;charset=UTF-8", $scope.wallet.toJSON());
            $scope.blobEnc = globalFuncs.getBlob("text/json;charset=UTF-8", $scope.wallet.toV3($scope.password, {
                kdf: globalFuncs.kdf,
                n: globalFuncs.scrypt.n
            }));
            $scope.walletEnc = $scope.wallet.toV3($scope.password, {
                kdf: globalFuncs.kdf,
                n: globalFuncs.scrypt.n
            });
            $scope.encFileName = $scope.wallet.getV3Filename();
            if (parent != null)
                parent.postMessage(JSON.stringify({ address: $scope.wallet.getAddressString(), checksumAddress: $scope.wallet.getChecksumAddressString() }), "*");
            $scope.isDone = true;

            //TODO: Callback with  wallet
            console.log("Generated wallet:", $scope.wallet.toJSON());
            globalFuncs.callNativeApp(globalFuncs.WALLET_EVENTS.NEW_WALLET, $scope.wallet.toJSON());
            globalFuncs.callNativeApp(globalFuncs.WALLET_EVENTS.NEW_WALLET_ENC, $scope.walletEnc);
            
            if (!$scope.$$phase) $scope.$apply();
        }
    }

    window.externalGenerateWallet = function(password){
        $scope.$apply(function(){
            // TODO: Set password from external JS API
            console.log("External JS API creating wallet..")
            $scope.password = password;
            $scope.genNewWallet();
        });
    };

    $scope.printQRCode = function() {
        globalFuncs.printPaperWallets(JSON.stringify([{
            address: $scope.wallet.getChecksumAddressString(),
            private: $scope.wallet.getPrivateKeyString()
        }]));
    }
    $scope.isStrongPass = function() {
        return globalFuncs.isStrongPass($scope.password);
    }
    $scope.downloaded = function() {
        $scope.fileDownloaded = true;
    }
    $scope.continueToPaper = function() {
        $scope.showPaperWallet = true;
    }
    $scope.getAddress = function(){
        $scope.showPaperWallet = false;
        $scope.wallet = null;
        $scope.showGetAddress = true;
    }
};
module.exports = walletGenCtrl;
