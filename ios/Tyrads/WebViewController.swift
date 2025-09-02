import UIKit
@preconcurrency import WebKit

class AcmoWebViewController: UIViewController, WKNavigationDelegate, WKScriptMessageHandler, WKUIDelegate {

    var webView: WKWebView!
    var initialURL: URL
  
    private let internalDomains: [String] = ["sdk.tyrads.com", "acmo.in"]
    
    private func log(_ message: String) {
        NSLog("AcmoWebViewController: \(message)")
    }

    init(url: URL) {
        self.initialURL = url
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        log("viewDidLoad called")

        let config = WKWebViewConfiguration()
        let userContentController = WKUserContentController()

        userContentController.add(self, name: "clickHandler")
        config.userContentController = userContentController

        webView = WKWebView(frame: self.view.bounds, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self
        self.view.addSubview(webView)

        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: self.view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: self.view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: self.view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: self.view.trailingAnchor)
        ])

        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
        
        webView.load(URLRequest(url: initialURL))
        log("WebView loaded URL: \(initialURL.absoluteString)")
    }

    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "clickHandler",
              let messageDict = message.body as? [String: Any] else {
            log("Received unknown message or invalid format.")
            return
        }
        
        log("Message data from webview: \(messageDict)")

        if let action = messageDict["action"] as? String {
            switch action {
            case "closeWebView":
                log("Action: closeWebView received. Dismissing view controller.")
                DispatchQueue.main.async {
                    self.dismiss(animated: true) {
                        self.log("ViewController dismissed successfully.")
                    }
                }
                
            case "changeLanguage":
                if let langCode = messageDict["value"] as? String {
                    log("Action: changeLanguage received. Language Code: \(langCode)")
                  Tyrads.instance.changeLanguage(langCode)
//                  let value = UserDefaults.standard.string(forKey: "locale")
                }
                
            default:
                log("Unknown command: \(action)")
            }
        }
    }

    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        if let url = webView.url {
            print("Page loaded successfully. Final URL: \(url.absoluteString)")
        }
        
        let js = """
        window.addEventListener('message', (event) => {
            try {
                // Safely parse JSON if event.data is a string, otherwise use directly
                const message = typeof event.data === 'string'
                                ? JSON.parse(event.data)
                                : event.data;
                if (message) {
                    // Post the message to the native side using the registered handler name
                    window.webkit.messageHandlers.clickHandler.postMessage(message);
                }
            } catch (error) {
                console.error('Error handling message from WebView:', error);
            }
        });
        """
        
        webView.evaluateJavaScript(js) { _, error in
            if let error = error {
                self.log("JavaScript injection failed: \(error.localizedDescription)")
            } else {
                self.log("JavaScript listener injected successfully.")
            }
        }
    }
  
    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
          
        guard let url = navigationAction.request.url, let host = url.host else {
            decisionHandler(.cancel)
            return
        }
        
        if host == "about:blank" {
            decisionHandler(.allow)
            return
        }
        
        let isInternalDomain = internalDomains.contains(where: { host.hasSuffix($0) })
        
        if host != webView.url?.host && !isInternalDomain {
            log("Intercepted external URL via navigation action: \(url.absoluteString). Opening externally.")
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            decisionHandler(.cancel)
            return
        }
        
        log("Allowed navigation to: \(url.absoluteString)")
        decisionHandler(.allow)
    }
    
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        
        guard let url = navigationAction.request.url else {
            return nil
        }
        
        let isInternalDomain = internalDomains.contains(where: { url.host?.hasSuffix($0) ?? false })
        
        if !isInternalDomain {
            log("Intercepted new window via UI delegate: \(url.absoluteString). Opening externally.")
            UIApplication.shared.open(url, options: [:], completionHandler: nil)
            return nil
        }
        
        log("Allowed new window for internal domain: \(url.absoluteString)")
        return nil
    }
    
    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        log("WebView navigation failed with error: \(error.localizedDescription)")
    }

    public func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        log("WebView provisional navigation failed with error: \(error.localizedDescription)")
    }

    deinit {
        webView.configuration.userContentController.removeScriptMessageHandler(forName: "clickHandler")
        log("AcmoWebViewController deinitialized. Message handler removed.")
    }
}
